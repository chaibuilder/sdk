// @ts-ignore
import { parse, stringify } from "himalaya";
import {
  capitalize,
  filter,
  find,
  flatMapDeep,
  flatten,
  forEach,
  get,
  has,
  includes,
  isEmpty,
  set,
  some,
  startsWith,
} from "lodash-es";
import { STYLES_KEY } from "../constants/STRINGS.ts";
import { cn, generateUUID } from "../functions/Functions.ts";
import { ChaiBlock } from "../types/types.ts";
import { getVideoURLFromHTML, hasVideoEmbed } from "./import-video.ts";

type Node = {
  type: "element" | "text" | "comment";
  tagName: string;
  attributes: Array<Record<string, string>>;
  children: Node[];
};

const NAME_ATTRIBUTES = ["chai-name", "data-chai-name"];

const ATTRIBUTE_MAP: Record<string, Record<string, string>> = {
  img: { alt: "alt", width: "width", height: "height", src: "image" },
  video: {
    src: "url",
    autoplay: "controls.autoPlay",
    muted: "controls.muted",
    loop: "controls.loop",
    controls: "controls.widgets",
  },
  a: {
    href: "link.href",
    target: "link.target",
    type: "", // @TODO: Detect here what to url, email, phone, elementId
  },
  input: {
    placeholder: "placeholder",
    required: "required",
    type: "inputType",
    name: "fieldName",
  },
  textarea: {
    placeholder: "placeholder",
    required: "required",
    type: "inputType",
    name: "fieldName",
  },
  select: {
    placeholder: "placeholder",
    required: "required",
    multiple: "multiple",
    name: "fieldName",
  },
  form: {
    action: "action",
  },
};

/**
 *
 * @param node
 * @param block
 * @returns Condition add text as content
 */
const shouldAddText = (node: Node, block: any) => {
  return (
    node.children.length === 1 &&
    includes(
      ["Heading", "Paragraph", "Span", "ListItem", "Button", "Label", "TableCell", "Link", "RichText"],
      block._type,
    )
  );
};

/**
 *
 * @param nodes
 * @returns from list of nested nodes extracting only text type content
 */
const getTextContent = (nodes: Node[]): string => {
  return nodes
    .map((node) => {
      if (node.type === "text") return get(node, "content", "");
      else if (!isEmpty(node.children)) return getTextContent(node.children);
      return "";
    })
    .join("");
};

/**
 *
 * @param value
 * @returns For boolean attributes without content marking true and passing if value is null
 */
const getSanitizedValue = (value: any) => (value === null ? "" : value);

/**
 *
 * @returns Mapping Attributes as per blocks need from @ATTRIBUTE_MAP and rest passing as it is
 * @param node
 */
const getAttrs = (node: Node) => {
  if (node.tagName === "svg") return {};

  const attrs: Record<string, string> = {};
  const replacers = ATTRIBUTE_MAP[node.tagName] || {};
  const attributes: Array<{ key: string; value: string }> = node.attributes as any;

  forEach(attributes, ({ key, value }) => {
    if (includes(NAME_ATTRIBUTES, key)) return;
    if (replacers[key]) {
      // for img tag if the src is not absolute then replace with placeholder image
      if (node.tagName === "img" && key === "src" && !value.startsWith("http")) {
        const width = find(node.attributes, { key: "width" }) as { value: string } | undefined;
        const height = find(node.attributes, { key: "height" }) as { value: string } | undefined;
        if (width && height) {
          value = `https://via.placeholder.com/${width?.value}x${height?.value}`;
        } else {
          value = `https://via.placeholder.com/150x150`;
        }
      }
      set(attrs, replacers[key], getSanitizedValue(value));
    } else if (!includes(["style", "class", "srcset"], key)) {
      if (!has(attrs, "styles_attrs")) {
        // @ts-ignore
        attrs.styles_attrs = {};
      }
      if (startsWith(key, "@")) {
        key = key.replace("@", "x-on:");
      }
      attrs.styles_attrs[`${key}`] = getSanitizedValue(value);
    }
  });

  delete attrs.class;
  return attrs;
};

const getStyles = (node: Node, propKey: string = "styles"): Record<string, string> => {
  if (!node.attributes) return { [propKey]: `${STYLES_KEY},` };
  // @ts-ignore
  const classAttr = find(node.attributes, { key: "class" }) as { value: string } | undefined;
  if (classAttr) {
    const styleString = classAttr.value;
    return { [propKey]: `${STYLES_KEY},${styleString}` };
  }
  return { [propKey]: `${STYLES_KEY},` };
};

const getBlockProps = (node: Node): Record<string, any> => {
  const attributes = get(node, "attributes", []);
  const isRichText = attributes.find((attr) => attr.key === "data-chai-richtext" || attr.key === "chai-richtext");
  const isLightboxLink = attributes.find((attr) => attr.key === "data-chai-lightbox" || attr.key === "chai-lightbox");

  const isDropdown = attributes.find((attr) => attr.key === "data-chai-dropdown" || attr.key === "chai-dropdown");
  const isDropdownButton = attributes.find(
    (attr) => attr.key === "data-chai-dropdown-button" || attr.key === "chai-dropdown-button",
  );
  const isDropdownContent = attributes.find(
    (attr) => attr.key === "data-chai-dropdown-content" || attr.key === "chai-dropdown-content",
  );

  // Check for special attributes first
  if (isDropdown) {
    return { _type: "Dropdown" };
  }

  if (isDropdownButton) {
    return { _type: "DropdownButton" };
  }

  if (isDropdownContent) {
    return { _type: "DropdownContent" };
  }

  if (isRichText) {
    return { _type: "RichText" };
  }

  if (isLightboxLink) {
    return { _type: "LightBoxLink" };
  }

  // Default block props based on tag
  switch (node.tagName) {
    // self closing tags
    case "img":
      return { _type: "Image" };
    case "input":
      return { _type: "Input", showLabel: false }; // showLabel: hiding default block label
    case "hr":
      return { _type: "Divider" };
    case "br":
      return { _type: "LineBreak" };
    case "textarea":
      return { _type: "TextArea", showLabel: false };
    case "audio":
      return { _type: "Audio" };
    case "canvas":
      return { _type: "Canvas" };
    case "video":
    case "iframe":
      return { _type: "CustomHTML" };
    case "svg":
      return { _type: "Icon" };

    // non self closing tags
    // fixed structure
    case "select":
      return { _type: "Select", options: [] };
    case "option":
      return { _type: "Option" };
    case "ul":
    case "ol":
    case "dl":
      return {
        _type: "List",
        tag: node.tagName,
        _listType: node.tagName === "ol" ? "list-decimal" : "list-none",
      };
    case "li":
    case "dt":
      return { _type: "ListItem", tag: node.tagName };

    // non self closing tags
    // free flow structure
    case "span":
    case "figcaption":
    case "legend":
      return { _type: "Span", tag: node.tagName };
    case "p":
      return { _type: "Paragraph", content: "" };
    case "a":
      return { _type: "Link" };
    case "form":
      return { _type: "Form" };
    case "label":
      return { _type: "Label" };
    case "button":
      return { _type: "Button" };
    case "code":
      return { _type: "Code" };
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6":
      return { _type: "Heading", tag: node.tagName };
    case "table":
      return { _type: "Table" };
    case "tr":
      return { _type: "TableRow" };
    case "td":
    case "th":
      return { _type: "TableCell", tag: node.tagName };
    case "thead":
      return { _type: "TableHead" };
    case "tbody":
      return { _type: "TableBody" };
    case "tfoot":
      return { _type: "TableFooter" };

    default: {
      const type = get(node, "children", []).length > 0 ? "Box" : "EmptyBox";
      return {
        _type: type,
        tag: node.tagName,
        _name: type == "EmptyBox" ? type : node.tagName === "div" ? type : capitalize(node.tagName),
      };
    }
  }
};

/**
 *
 * @param nodes
 * @param parent { block, node }
 * @returns Traversing all nodes one by one and mapping there style, attribute and block type
 */
const traverseNodes = (nodes: Node[], parent: any = null): ChaiBlock[] => {
  return flatMapDeep(nodes, (node: Node) => {
    // * Ignoring code comment nodes
    if (node.type === "comment") return [];
    console.log("node ===>", node);

    // * Generating block id and setting parent id if nested
    let block: Partial<ChaiBlock<any>> = { _id: generateUUID() };
    if (parent) block._parent = parent.block._id;

    /**
     * @handling_textcontent
     * Checking if parent exist
     * If parent has only one children and current node type is text
     * checking does parent block type support content
     * setting parent content to current node text content
     * returning empty node
     */
    if (node.type === "text") {
      if (isEmpty(get(node, "content", ""))) return [] as any;
      if (parent) {
        if (shouldAddText(parent.node, parent.block)) {
          set(parent, "block.content", get(node, "content", ""));
          return [] as ChaiBlock[];
        }
      }
      return { ...block, _type: "Text", content: get(node, "content", "") };
    }

    const styleAttributes = get(node, "attributes", []);
    const isRichText = styleAttributes.find(
      (attr) => attr.key === "data-chai-richtext" || attr.key === "chai-richtext",
    );
    const isLightboxLink = styleAttributes.find(
      (attr) => attr.key === "data-chai-lightbox" || attr.key === "chai-lightbox",
    );
    const isDropdown = styleAttributes.find(
      (attr) => attr.key === "data-chai-dropdown" || attr.key === "chai-dropdown",
    );
    const isDropdownButton = styleAttributes.find(
      (attr) => attr.key === "data-chai-dropdown-button" || attr.key === "chai-dropdown-button",
    );
    const isDropdownContent = styleAttributes.find(
      (attr) => attr.key === "data-chai-dropdown-content" || attr.key === "chai-dropdown-content",
    );

    // * Adding default block props, default attrs and default style
    block = {
      ...block,
      ...getBlockProps(node),
      ...getAttrs(node),
      ...getStyles(node),
    };

    // node has a x-name attribute. set the _name of the block to the value of x-name and
    // remove the attribute from the node
    if (node.attributes) {
      const xName = node.attributes.find((attr) => includes(NAME_ATTRIBUTES, attr.key));
      if (xName) {
        block._name = xName.value;
      }
    }

    if (isRichText) {
      block.content = stringify(node.children);
      if (has(block, "styles_attrs.data-chai-richtext")) {
        delete block.styles_attrs["data-chai-richtext"];
      }
      if (has(block, "styles_attrs.chai-richtext")) {
        delete block.styles_attrs["chai-richtext"];
      }
      return [block] as ChaiBlock[];
    }

    if (isLightboxLink) {
      const lightboxAttrs = [
        "data-chai-lightbox",
        "chai-lightbox",
        "data-vbtype",
        "data-autoplay",
        "data-maxwidth",
        "data-overlay",
        "data-gall",
        "href",
      ];

      block = {
        ...block,
        href: styleAttributes.find((attr) => attr.key === "href")?.value || "",
        hrefType: styleAttributes.find((attr) => attr.key === "data-vbtype")?.value || "video",
        autoplay: styleAttributes.find((attr) => attr.key === "data-autoplay")?.value === "true" ? "true" : "false",
        maxWidth: styleAttributes.find((attr) => attr.key === "data-maxwidth")?.value?.replace("px", "") || "",
        backdropColor: styleAttributes.find((attr) => attr.key === "data-overlay")?.value || "",
        galleryName: styleAttributes.find((attr) => attr.key === "data-gall")?.value || "",
      };
      forEach(lightboxAttrs, (attr) => {
        if (has(block, `styles_attrs.${attr}`)) {
          delete block.styles_attrs[attr];
        }
      });
    }

    if (isDropdown) {
      delete block.styles_attrs;
      block.showDropdown = false;
    }

    if (isDropdownContent) {
      delete block.styles_attrs;
    }

    if (isDropdownButton) {
      delete block.styles_attrs;

      // Get text content from non-span children more safely
      const textNodes = filter(node.children || [], (child) => child?.tagName !== "span");
      block.content = getTextContent(textNodes);

      // Find span containing SVG more defensively
      const spanWithSvg = find(
        node.children || [],
        (child) =>
          child?.tagName === "span" && some(child.children || [], (grandChild) => grandChild?.tagName === "svg"),
      );

      if (spanWithSvg) {
        const svg = find(spanWithSvg.children || [], (child) => child?.tagName === "svg");
        if (svg) {
          block.icon = stringify([svg]);
          const { height, width } = getSvgDimensions(svg, "16px", "16px");
          block.iconHeight = height;
          block.iconWidth = width;
        }
      }

      return [block] as ChaiBlock[];
    }

    if (block._type === "Input") {
      /**
       * hanlding input tag mapping type to input type
       * setting block _type to non-standard inputs like checkbox, radio, range, file
       */
      const inputType = block.inputType || "text";
      if (inputType === "checkbox") set(block, "_type", "Checkbox");
      else if (inputType === "radio") set(block, "_type", "Radio");
    } else if (node.tagName === "video" || node.tagName === "iframe") {
      const innerHTML = stringify([node]);
      if (hasVideoEmbed(innerHTML)) {
        set(block, "_type", "Video");
        set(block, "url", getVideoURLFromHTML(innerHTML));
        set(block, "styles", `${STYLES_KEY},`);
        set(block, "controls", { autoPlay: false, muted: true, loop: false, controls: false });
      }
      block.content = innerHTML;
      return [block] as ChaiBlock[];
    } else if (node.tagName === "svg") {
      /**
       * handling svg tag
       * if svg tag just pass html stringify content as icon
       */
      const svgHeight = find(node.attributes, { key: "height" });
      const svgWidth = find(node.attributes, { key: "width" });
      const height = get(svgHeight, "value") ? `[${get(svgHeight, "value")}px]` : "24px";
      const width = get(svgWidth, "value") ? `[${get(svgWidth, "value")}px]` : "24px";
      const svgClass = get(find(node.attributes, { key: "class" }), "value", "w-full h-full");
      block.styles = `${STYLES_KEY}, ${cn(`w-${width} h-${height}`, svgClass)}`.trim();

      node.attributes = filter(node.attributes, (attr) => !includes(["style", "width", "height", "class"], attr.key));
      block.icon = stringify([node]);
      return [block] as ChaiBlock[];
    } else if (node.tagName == "option" && parent && parent.block?._type === "Select") {
      /**
       * mapping select options as underscore options
       * for label extracting string from all option child and mapping all attributes
       */
      parent.block.options.push({
        label: getTextContent(node.children),
        ...getAttrs(node),
      });
      return [] as any;
    }

    const children = traverseNodes(node.children, { block, node });
    return [block, ...children] as ChaiBlock[];
  });
};

const getSvgDimensions = (node: Node, defaultWidth: string, defaultHeight: string) => {
  const attributes = get(node, "attributes", []);
  const svgHeight = find(attributes, { key: "height" });
  const svgWidth = find(attributes, { key: "width" });

  return {
    height: get(svgHeight, "value") ? `[${get(svgHeight, "value")}px]` : defaultHeight,
    width: get(svgWidth, "value") ? `[${get(svgWidth, "value")}px]` : defaultWidth,
  };
};

/**
 *
 * @param html
 * @returns sanitizing html content
 */
export const getSanitizedHTML = (html: string) => {
  // First, handle the JSON-like structures in attributes
  html = html.replace(/(\w+)=\\?"(.*?)\\?"/g, (_match, attr, value) => {
    // Remove initial escaping
    let cleanValue = value.replace(/\\"/g, '"');

    // Re-escape quotes that are part of JSON structure
    cleanValue = cleanValue.replace(/{([^}]+)}/g, (jsonMatch) => {
      return jsonMatch.replace(/"/g, '\\"');
    });

    // Unescape the outer quotes and return
    return `${attr}="${cleanValue.replace(/\\"/g, '"')}"`;
  });

  // Rest of the function remains the same
  html = html
    .replace(/\\n/g, "")
    .replace(/\\\\/g, "")
    .replace(/\\([/<>])/g, "$1")
    .replace(/\\./g, "")
    .replace(/[\n\r\t\f\v]/g, "");

  // Remove $name attributes
  html = html.replace(/\$name="[^"]*"/g, "");

  const bodyContent = html.match(/<body[^>]*>[\s\S]*?<\/body>/);
  const htmlContent =
    bodyContent && bodyContent.length > 0
      ? bodyContent[0].replace(/<body/, "<div").replace(/<\/body>/, "</div>")
      : html;

  return htmlContent
    .replace(/\s+/g, " ")
    .replaceAll("> <", "><")
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .trim();
};

/**
 *
 * @param html
 * @returns Blocks JSON
 */
export const getBlocksFromHTML = (html: string): ChaiBlock[] => {
  const nodes: Node[] = parse(getSanitizedHTML(html));
  if (isEmpty(html)) return [];
  return flatten(traverseNodes(nodes)) as ChaiBlock[];
};

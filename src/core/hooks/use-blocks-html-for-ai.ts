import { parse, stringify } from "himalaya";
import { kebabCase } from "lodash-es";
import { useCallback } from "react";
import { useCanvasIframe } from "./use-canvas-iframe";
import { useSelectedBlock } from "./use-selected-blockIds";

export type HimalayaNode = {
  type: "element" | "text" | "comment";
  tagName?: string;
  attributes?: Array<{ key: string; value: string }>;
  children?: HimalayaNode[];
  content?: string;
};

const ATTRIBUTES_TO_REMOVE = ["data-block-index", "data-drop", "data-style-id", "data-block-parent", "data-style-prop"];

const CORE_BLOCKS = [
  "Box",
  "Button",
  "Checkbox",
  "Divider",
  "EmptyBox",
  "Form",
  "FormButton",
  "Heading",
  "Icon",
  "Image",
  "Input",
  "Label",
  "LineBreak",
  "Link",
  "List",
  "ListItem",
  "Paragraph",
  "Radio",
  "RichText",
  "Select",
  "Span",
  "Text",
  "TextArea",
  "Video",
];

const cleanNode = (node: HimalayaNode): HimalayaNode | null => {
  // Remove script, style, and link tags
  if (node.type === "element" && ["script", "style", "link"].includes(node.tagName || "")) {
    return null;
  }

  if (node.type === "comment") {
    return null;
  }

  // Keep text and comment nodes as is
  if (node.type === "text") {
    return node;
  }

  // Clean attributes for element nodes
  if (node.type === "element" && node.attributes) {
    node.attributes = node.attributes.filter((attr) => !ATTRIBUTES_TO_REMOVE.includes(attr.key));
  }

  // Recursively clean children
  if (node.children) {
    node.children = node.children.map(cleanNode).filter((child): child is HimalayaNode => child !== null);
  }

  return node;
};

export const transformNode = (node: HimalayaNode): HimalayaNode => {
  // Only process element nodes
  if (node.type !== "element" || !node.attributes) {
    return node;
  }

  // Find data-block-type attribute
  const blockTypeAttr = node.attributes.find((attr) => attr.key === "data-block-type");
  const blockIdAttr = node.attributes.find((attr) => attr.key === "data-block-id");

  if (blockTypeAttr) {
    const blockType = blockTypeAttr.value;

    if (CORE_BLOCKS.includes(blockType)) {
      // For core blocks, just remove the data-block-type attribute
      node.attributes = node.attributes.filter((attr) => attr.key !== "data-block-type");

      // Recursively transform children for core blocks
      if (node.children) {
        node.children = node.children.map(transformNode);
      }
    } else {
      // For custom blocks, convert to web component style tag
      const customTagName = `chai-${kebabCase(blockType)}`;

      // Create new node with custom tag name
      node.tagName = customTagName;

      // Keep only the id attribute (from data-block-id)
      if (blockIdAttr) {
        node.attributes = [{ key: "id", value: blockIdAttr.value }];
      } else {
        node.attributes = [];
      }

      // Remove all children for custom blocks
      node.children = [];
    }
  } else {
    // For nodes without data-block-type, recursively transform children
    if (node.children) {
      node.children = node.children.map(transformNode);
    }
  }

  //remove data-block-type and data-block-id attributes
  node.attributes = node.attributes.filter((attr) => attr.key !== "data-block-type" && attr.key !== "data-block-id");

  return node;
};

export const useBlocksHtmlForAi = () => {
  const selectedBlock = useSelectedBlock();
  const [iframeDocument] = useCanvasIframe();
  return useCallback(() => {
    if (!iframeDocument) return "";

    const html =
      (iframeDocument as HTMLIFrameElement).contentDocument?.querySelector(`[data-block-id="${selectedBlock._id}"]`)
        ?.outerHTML ?? "";

    if (!html) return "";

    // Parse HTML into AST
    const nodes = parse(html) as HimalayaNode[];

    // Clean nodes
    const cleanedNodes = nodes.map(cleanNode).filter((node): node is HimalayaNode => node !== null);

    // Transform nodes: remove data-block-type for core blocks, convert custom blocks to web components
    const transformedNodes = cleanedNodes.map(transformNode);

    // Convert back to HTML and normalize whitespace
    let cleanedHtml = stringify(transformedNodes);

    // Convert empty custom web component tags to self-closing format
    cleanedHtml = cleanedHtml.replace(/<(chai-[a-z-]+)([^>]*)><\/\1>/g, "<$1$2 />");

    console.log(cleanedHtml);
    return cleanedHtml.replace(/\s+/g, " ").trim();
  }, [selectedBlock, iframeDocument]);
};

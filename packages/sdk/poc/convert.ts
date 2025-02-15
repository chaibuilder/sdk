import * as cheerio from "cheerio";
import { get } from "lodash-es";
import { html } from "./html.ts";

const generateUUID = () => Math.random().toString(36).substring(2, 5);

export type ChaiBlock = {
  _id: string;
  _type: string;
  _name?: string;
  _parent?: string | null | undefined;
} & Record<string, any>;

const TAG_TYPE_MAP: Record<string, string> = {
  p: "Paragraph",
  span: "Span",
  a: "Link",
  h1: "Heading",
  h2: "Heading",
  h3: "Heading",
  h4: "Heading",
  h5: "Heading",
  h6: "Heading",
  img: "Image",
  svg: "Icon",
};

// const ATTRS_TO_SKIP = ["class", "style", "src", "alt", "width", "height"];

function parseHTMLToChaiBlocks(html: string): ChaiBlock[] {
  const $ = cheerio.load(html);
  const blocks: ChaiBlock[] = [];

  function traverse(node: cheerio.Element | any, parentId: string | null = null): void {
    if (node.type === "text" && node.data.trim() === "") return;
    const type = get(TAG_TYPE_MAP, node.tagName, node.tagName);
    const block: ChaiBlock = {
      _id: generateUUID(),
      _type: type === "div" ? "Box" : type ? type : "Text",
      ...(parentId ? { _parent: parentId } : {}),
    };

    if (block._type === "Text") {
      block.content = node.data.trim();
    }

    // // if class attribute exists add it to the block as styles
    // if (node.attribs.class) {
    //   block.styles = `#styles:,${node.attribs.class}`;
    // }
    //
    // //if svg tag
    // if (type === "Icon") {
    //   block._type = "Icon";
    //   $(node).removeAttr("class");
    //   block.icon = $(node).prop("outerHTML");
    //   block.width = node.attribs.width;
    //   block.height = node.attribs.height;
    // }
    //
    // //remainign attributes as styles_attrs
    // if (node.attribs) {
    //   const attrs = {};
    //   if (type !== "Icon") {
    //     Object.keys(node.attribs).forEach((key) => {
    //       if (!ATTRS_TO_SKIP.includes(key)) {
    //         attrs[key] = node.attribs[key];
    //       }
    //     });
    //     if (!isEmpty(attrs)) block.styles_attrs = attrs;
    //   }
    // }

    blocks.push(block);

    node.children?.forEach((child) => {
      if (child.type !== "comment") {
        //@ts-ignore
        traverse(child, block._id);
      }
    });
  }

  $("body")
    .children()
    .each((_, element) => traverse(element));
  return blocks;
}

const chaiBlocks = parseHTMLToChaiBlocks(html);
console.log(chaiBlocks);

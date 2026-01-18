declare module "undo-manager";

declare module "himalaya" {
  export interface HimalayaAttribute {
    key: string;
    value: string;
  }

  export interface HimalayaNode {
    type: "element" | "text" | "comment";
    tagName?: string;
    attributes?: HimalayaAttribute[];
    children?: HimalayaNode[];
    content?: string;
  }

  export function parse(html: string): HimalayaNode[];
  export function stringify(nodes: HimalayaNode[]): string;
}

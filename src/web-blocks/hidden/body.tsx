import { ChaiBlockComponentProps, ChaiStyles, registerChaiBlockSchema, StylesProp } from "@chaibuilder/runtime";
import { createElement } from "react";

export type BodyProps = {
  styles: ChaiStyles;
  backgroundImage: string;
  tag: string;
};

const BodyBlock = (props: ChaiBlockComponentProps<BodyProps>) => {
  const { blockProps, backgroundImage, children, styles, tag } = props;

  let cssStyles = {};
  if (backgroundImage) {
    cssStyles = { backgroundImage: `url(${backgroundImage})` };
  }

  return createElement(tag || "div", { ...blockProps, ...styles, style: cssStyles }, children);
};

const Config = {
  type: "Body",
  label: "Body",
  category: "core",
  group: "basic",
  hidden: true,
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp("font-body antialiased"),
      backgroundImage: {
        type: "string",
        title: "Image",
        default: "",
        ui: { "ui:widget": "image" },
      },
      tag: {
        type: "string",
        default: "div",
        title: "Tag",
        oneOf: [
          { const: "div", title: "div" },
          { const: "header", title: "header" },
          { const: "footer", title: "footer" },
          { const: "section", title: "section" },
          { const: "article", title: "article" },
          { const: "aside", title: "aside" },
          { const: "main", title: "main" },
          { const: "nav", title: "nav" },
          { const: "figure", title: "figure" },
          { const: "details", title: "details" },
          { const: "summary", title: "summary" },
          { const: "dialog", title: "dialog" },
          { const: "strike", title: "strike" },
          { const: "caption", title: "caption" },
          { const: "legend", title: "legend" },
          { const: "figcaption", title: "figcaption" },
          { const: "mark", title: "mark" },
        ],
      },
    },
  }),
  canAcceptBlock: () => true,
  canDelete: () => false,
  canMove: () => false,
  canDuplicate: () => false,
};

export { BodyBlock as Component, Config };

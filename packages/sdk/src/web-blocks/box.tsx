import { ChaiBlockComponentProps, ChaiStyles, registerChaiBlockSchema, StylesProp } from "@chaibuilder/runtime";
import * as React from "react";
import EmptySlot from "./empty-slot.tsx";

export type BoxProps = {
  tag: string;
  backgroundImage: string;
  styles: ChaiStyles;
};

const Component = (props: ChaiBlockComponentProps<BoxProps>) => {
  const { blockProps, inBuilder, backgroundImage, children, tag = "div", styles } = props;
  let nestedChildren = children;
  if (!children) {
    nestedChildren = <EmptySlot inBuilder={inBuilder} />;
  }

  let cssStyles = {};
  if (backgroundImage) {
    cssStyles = { backgroundImage: `url(${backgroundImage})` };
  }

  return React.createElement(tag, { ...blockProps, ...styles, style: cssStyles }, nestedChildren);
};

const Config = {
  type: "Box",
  label: "Box",
  category: "core",
  group: "basic",
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp(""),
      backgroundImage: {
        type: "string",
        default: "",
        title: "Background Image",
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
};

export { Component, Config };

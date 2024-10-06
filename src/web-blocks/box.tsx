import * as React from "react";
import { Image, SelectOption, Styles } from "@chaibuilder/runtime/controls";
import EmptySlot from "./empty-slot.tsx";

const Component = (
  props: any & {
    children: React.ReactNode;
    styles: any;
    tag: string;
    backgroundImage: string;
    blockProps: Record<string, string>;
  },
) => {
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
  label: "web_blocks.box",
  category: "core",
  group: "basic",
  props: {
    styles: Styles({ default: "" }),
    tag: SelectOption({
      title: "web_blocks.tag",
      default: "div",
      options: [
        { value: "div", title: "web_blocks.div" },
        { value: "header", title: "web_blocks.header" },
        { value: "footer", title: "web_blocks.footer" },
        { value: "section", title: "web_blocks.section" },
        { value: "article", title: "web_blocks.article" },
        { value: "aside", title: "web_blocks.aside" },
        { value: "main", title: "web_blocks.main" },
        { value: "nav", title: "web_blocks.nav" },
        { value: "figure", title: "web_blocks.figure" },
        { value: "details", title: "web_blocks.details" },
        { value: "summary", title: "web_blocks.summary" },
        { value: "dialog", title: "web_blocks.dialog" },
        { value: "strike", title: "web_blocks.strike" },
        { value: "caption", title: "web_blocks.caption" },
        { value: "legend", title: "web_blocks.legend" },
        { value: "figcaption", title: "web_blocks.figcaption" },
        { value: "mark", title: "web_blocks.mark" },
      ],
    }),
    backgroundImage: Image({ title: "web_blocks.background_image" }),
  },
  canAcceptBlock: () => true,
};

export { Component, Config };

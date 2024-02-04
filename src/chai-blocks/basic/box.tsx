import * as React from "react";
import type { ChaiBlock } from "../../core/main";
import { Image, registerChaiBlock, SelectOption, Styles } from "@chaibuilder/blocks";
import { isEmpty } from "lodash";
import EmptySlot from "./empty-slot";
import { setBlockProps } from "../../core/lib";

const BoxBlock = (
  props: ChaiBlock & {
    children: React.ReactNode;
    styles: any;
    tag: string;
    backgroundImage: string;
    blockProps: Record<string, string>;
  },
) => {
  const { blockProps, backgroundImage, children, tag = "div", styles } = props;

  if (!children && isEmpty(styles?.className)) {
    return <EmptySlot blockProps={blockProps} styles={styles} />;
  }
  let cssStyles = {};
  if (backgroundImage) {
    cssStyles = { backgroundImage: `url(${backgroundImage})` };
  }

  return React.createElement(tag, { ...setBlockProps(blockProps), ...styles, style: cssStyles }, children);
};

registerChaiBlock(BoxBlock, {
  type: "Box",
  label: "Box",
  category: "core",
  group: "basic",
  props: {
    styles: Styles({ default: "" }),
    tag: SelectOption({
      title: "Tag",
      default: "div",
      options: [
        { value: "div", title: "div" },
        { value: "header", title: "header" },
        { value: "footer", title: "footer" },
        { value: "section", title: "section" },
        { value: "article", title: "article" },
        { value: "aside", title: "aside" },
        { value: "main", title: "main" },
        { value: "nav", title: "nav" },
        { value: "figure", title: "figure" },
        { value: "details", title: "details" },
        { value: "summary", title: "summary" },
        { value: "dialog", title: "dialog" },
        { value: "strike", title: "strike" },
        { value: "caption", title: "caption" },
        { value: "legend", title: "legend" },
        { value: "figcaption", title: "figcaption" },
        { value: "mark", title: "mark" },
      ],
    }),
    backgroundImage: Image({ title: "Background Image" }),
  },
});

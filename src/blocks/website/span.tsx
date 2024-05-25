import * as React from "react";
import { ChaiBlock } from "../../core/types/ChaiBlock.ts";
import { registerChaiBlock } from "@chaibuilder/runtime";
import { MultilineText, Styles } from "@chaibuilder/runtime/controls";

const SpanBlock = (
  props: ChaiBlock & {
    children: React.ReactNode;
    styles: any;
    blockProps: Record<string, string>;
  },
) => {
  const { blockProps, styles, content, children = null, tag } = props;

  if (children) return React.createElement("span", { ...styles, ...blockProps }, children);

  return React.createElement(tag || "span", {
    ...styles,
    ...blockProps,
    dangerouslySetInnerHTML: { __html: content },
  });
};

registerChaiBlock(SpanBlock, {
  type: "Span",
  label: "Span",
  category: "core",
  group: "basic",
  props: {
    styles: Styles({ default: "" }),
    content: MultilineText({ title: "Content", default: "Enter your content" }),
  },
});

export default SpanBlock;

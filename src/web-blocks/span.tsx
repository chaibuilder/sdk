import * as React from "react";
import { MultilineText, Styles } from "@chaibuilder/runtime/controls";
import { registerChaiBlock } from "@chaibuilder/runtime";
import { ChaiBlock } from "../core/types/ChaiBlock.ts";

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
    "data-ai-key": "content",
    dangerouslySetInnerHTML: { __html: content },
  });
};

registerChaiBlock(SpanBlock, {
  type: "Span",
  label: "Span",
  category: "core",
  group: "typography",
  props: {
    styles: Styles({ default: "" }),
    content: MultilineText({ title: "Content", default: "" }),
  },
  canAcceptBlock: () => true,
});

export default SpanBlock;

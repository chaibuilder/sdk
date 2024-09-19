import * as React from "react";
import { MultilineText, Styles } from "@chaibuilder/runtime/controls";
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

const Config = {
  type: "Span",
  label: "web_blocks.span",
  category: "core",
  group: "typography",
  props: {
    styles: Styles({ default: "" }),
    content: MultilineText({ title: "web_blocks.content", default: "" }),
  },
  canAcceptBlock: () => true,
};

export { SpanBlock as Component, Config };

import { ChaiBlockComponentProps, ChaiStyles, registerChaiBlockSchema, StylesProp } from "@chaibuilder/runtime";
import * as React from "react";
import { addForcedClasses } from "./helper";

export type SpanProps = {
  styles: ChaiStyles;
  content: string;
  tag: string;
};

const SpanBlock = (props: ChaiBlockComponentProps<SpanProps>) => {
  const { blockProps, styles, content, children = null, tag } = props;

  if (children) return React.createElement("span", { ...styles, ...blockProps }, children);

  const forcedStyles = addForcedClasses(
    styles,
    "prose dark:prose-invert prose-p:m-0 prose-p:min-h-[1rem] prose-blockquote:m-2 prose-blockquote:ml-4 prose-ul:m-0 prose-ol:m-0 prose-li:m-0",
    "max-w-full",
  );

  return React.createElement(tag || "span", {
    ...forcedStyles,
    ...blockProps,
    dangerouslySetInnerHTML: { __html: content || "" },
  });
};

const Config = {
  type: "Span",
  description: "A span component",
  label: "Span",
  category: "core",
  group: "typography",
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp(""),
      content: {
        type: "string",
        title: "Content",
        default: "",
        ui: { "ui:widget": "richtext", "ui:autosize": true, "ui:rows": 3 },
      },
    },
  }),
  aiProps: ["content"],
  i18nProps: ["content"],
  canAcceptBlock: () => true,
};

export { SpanBlock as Component, Config };

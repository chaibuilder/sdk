import { ChaiBlockComponentProps, ChaiStyles, registerChaiBlockSchema, StylesProp } from "@chaibuilder/runtime";
import * as React from "react";

export type SpanProps = {
  styles: ChaiStyles;
  content: string;
  tag: string;
};

const SpanBlock = (props: ChaiBlockComponentProps<SpanProps>) => {
  const { blockProps, styles, content, children = null, tag } = props;

  if (children) return React.createElement("span", { ...styles, ...blockProps }, children);

  return React.createElement(tag || "span", {
    ...styles,
    ...blockProps,
    dangerouslySetInnerHTML: { __html: content || "" },
  });
};

const Config = {
  type: "Span",
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
        ui: { "ui:widget": "textarea", "ui:autosize": true, "ui:rows": 3 },
      },
    },
  }),
  aiProps: ["content"],
  i18nProps: ["content"],
  canAcceptBlock: () => true,
};

export { SpanBlock as Component, Config };

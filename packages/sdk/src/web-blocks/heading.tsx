import * as React from "react";
import { HeadingIcon } from "@radix-ui/react-icons";
import { ChaiBlockComponentProps, ChaiStyles, registerChaiBlockSchema, StylesProp } from "@chaibuilder/runtime";

export type HeadingProps = {
  tag: string;
  styles: ChaiStyles;
  content: string;
};

const HeadingBlock = (props: ChaiBlockComponentProps<HeadingProps>) => {
  const { blockProps, styles, content, tag = "h1", children = null } = props;

  if (children) return React.createElement(tag, { ...styles, ...blockProps }, children);

  return React.createElement(tag, {
    ...styles,
    ...blockProps,
    dangerouslySetInnerHTML: { __html: content },
  });
};

const Config = {
  type: "Heading",
  label: "web_blocks.heading",
  category: "core",
  icon: HeadingIcon,
  group: "typography",
  ...registerChaiBlockSchema({
    properties: {
      tag: {
        type: "string",
        default: "h2",
        title: "Level",
        enum: ["h1", "h2", "h3", "h4", "h5", "h6"],
      },
      styles: StylesProp("text-3xl"),
      content: {
        type: "string",
        default: "Heading goes here",
        title: "Content",
        ui: { "ui:widget": "textarea" },
      },
    },
  }),
  aiProps: ["content"],
  i18nProps: ["content"],
  canAcceptBlock: (type) => type === "Span" || type === "Text",
};

export { HeadingBlock as Component, Config };

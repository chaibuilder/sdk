import { ChaiBlockComponentProps, ChaiStyles, StylesProp, registerChaiBlockSchema } from "@chaibuilder/runtime";
import { ColumnsIcon } from "@radix-ui/react-icons";
import * as React from "react";

export type ListItemBlockProps = {
  styles: ChaiStyles;
  content: string;
  tag?: string;
};

export const ListItemBlock = (props: ChaiBlockComponentProps<ListItemBlockProps>) => {
  const { blockProps, content, styles, children, tag } = props;
  if (!children) {
    return React.createElement(tag || "li", {
      ...styles,
      ...blockProps,
      dangerouslySetInnerHTML: { __html: content },
    });
  }
  return React.createElement(tag || "li", { ...styles, ...blockProps }, children);
};

const Config = {
  type: "ListItem",
  label: "List Item",
  icon: ColumnsIcon,
  category: "core",
  group: "basic",
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp(""),
      content: {
        type: "string",
        default: "List item",
        title: "Content",
        ui: {
          "ui:widget": "textarea",
        },
      },
    },
  }),
  i18nProps: ["content"],
  aiProps: ["content"],
  canAcceptBlock: (type: string) => type !== "ListItem",
  canBeNested: (type: string) => type === "List",
};

export { ListItemBlock as Component, Config };

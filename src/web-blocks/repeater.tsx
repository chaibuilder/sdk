import { ChaiBlockComponentProps, ChaiStyles, registerChaiBlockSchema, stylesProp } from "@chaibuilder/runtime";
import { LoopIcon } from "@radix-ui/react-icons";
import * as React from "react";

export type RepeaterProps = {
  children?: React.ReactNode;
  tag: string;
  styles: ChaiStyles;
};

export const Repeater = ({ children, tag, blockProps, styles }: ChaiBlockComponentProps<RepeaterProps>) => {
  return React.createElement(tag, { ...blockProps, ...styles }, children);
};

export const RepeaterConfig = {
  type: "Repeater",
  label: "Repeater",
  icon: LoopIcon,
  group: "basic",
  ...registerChaiBlockSchema({
    properties: {
      tag: {
        title: "Tag",
        type: "string",
        default: "ul",
        enum: ["div", "ul", "ol"],
      },
      styles: stylesProp(""),
      data: {
        title: "Data",
        type: "string",
        binding: "array",
        default: "",
      },
      limit: {
        title: "Limit",
        type: "number",
        default: "",
      },
      offset: {
        title: "Offset",
        type: "number",
        default: "",
      },
      sortBy: {
        title: "Sort By",
        type: "string",
        default: "",
      },
      sortOrder: {
        title: "Sort Order",
        type: "string",
        default: "asc",
        enum: ["asc", "desc"],
      },
      filters: {
        title: "Filters",
        type: "array",
        default: [],
        items: {
          type: "object",
          properties: {
            field: {
              title: "Field",
              type: "string",
              default: "",
            },
            value: {
              title: "Value",
              type: "string",
              default: "",
            },
          },
        },
      },
    },
  }),
  canAcceptBlock: (type: string) => type !== "Repeater",
};

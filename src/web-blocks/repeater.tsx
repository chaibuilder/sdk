import {
  ChaiBlockComponentProps,
  ChaiStyles,
  closestBlockProp,
  registerChaiBlockSchema,
  stylesProp,
} from "@chaibuilder/runtime";
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
  blocks: () => [
    { _id: "A", _type: "Repeater", tag: "ul" },
    { _id: "B", _type: "RepeaterItem", parentTag: "ul", _parent: "A" },
  ],
  ...registerChaiBlockSchema({
    properties: {
      data: {
        title: "Data",
        type: "string",
        binding: "array",
        default: "",
      },
      tag: {
        title: "Tag",
        type: "string",
        default: "ul",
        enum: ["div", "ul", "ol"],
      },
      styles: stylesProp(""),
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
};

export const RepeaterItem = ({
  children,
  blockProps,
  styles,
  parentTag,
}: ChaiBlockComponentProps<{ parentTag: string; styles: ChaiStyles }>) => {
  let tag = "li";
  switch (parentTag) {
    case "ul":
      tag = "li";
      break;
    case "ol":
      tag = "li";
      break;
    default:
      tag = "div";
  }
  return React.createElement(tag, { ...blockProps, ...styles }, children);
};

export const RepeaterItemConfig = {
  type: "RepeaterItem",
  label: "Repeater Item",
  icon: LoopIcon,
  hidden: true,
  group: "basic",
  ...registerChaiBlockSchema({
    properties: {
      styles: stylesProp(""),
      parentTag: closestBlockProp("Repeater", "tag"),
    },
  }),
  canAcceptBlock: (type: string) => type !== "RepeaterItem",
};

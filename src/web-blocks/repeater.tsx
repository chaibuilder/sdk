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
      styles: stylesProp(""),
      repeaterItems: {
        title: "Items",
        type: "string",
        binding: "array",
        default: "",
        ui: { "ui:readonly": true },
      },
      tag: {
        title: "Tag",
        type: "string",
        default: "ul",
        enum: ["div", "ul", "ol"],
      },
      limit: {
        title: "Limit",
        type: "number",
        default: 3,
      },
      filter: {
        title: "Filter by",
        type: "string",
        default: "",
        ui: { "ui:widget": "select" },
      },
      sort: {
        title: "Sort by",
        type: "string",
        default: "",
        ui: { "ui:widget": "select" },
      },
    },
  }),
};

export type RepeaterItemProps = {
  parentTag: string;
  styles: ChaiStyles;
};

export const RepeaterItem = ({
  children,
  blockProps,
  styles,
  parentTag,
}: ChaiBlockComponentProps<RepeaterItemProps>) => {
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
  canDelete: () => false,
  canMove: () => false,
  canDuplicate: () => false,
};

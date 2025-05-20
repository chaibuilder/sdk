import {
  ChaiBlockComponentProps,
  ChaiStyles,
  closestBlockProp,
  registerChaiBlockSchema,
  stylesProp,
} from "@chaibuilder/runtime";
import { LoopIcon } from "@radix-ui/react-icons";
import { isEmpty } from "lodash-es";
import * as React from "react";

export type RepeaterProps = {
  children?: React.ReactNode;
  tag: string;
  styles: ChaiStyles;
};

export const Repeater = ({ children, tag, blockProps, styles, inBuilder }: ChaiBlockComponentProps<RepeaterProps>) => {
  let items = children;
  if (isEmpty(items) && inBuilder) {
    items = <div className="col-span-3 flex items-center justify-center bg-orange-50 p-5">No items found</div>;
  }
  return React.createElement(tag, { ...blockProps, ...styles }, items);
};

export const RepeaterConfig = {
  type: "Repeater",
  label: "Repeater",
  icon: LoopIcon,
  group: "basic",
  asyncProps: ["filter", "sort", "limit", "repeaterItems"],
  blocks: () => [
    { _id: "A", _type: "Repeater", tag: "ul" },
    { _id: "B", _name: "Repeater Item", _type: "RepeaterItem", parentTag: "ul", _parent: "A" },
    // { _id: "C", _name: "Empty State", _type: "RepeaterEmptyState", _parent: "A" },
    // {
    //   _id: "D",
    //   _name: "Empty State Heading",
    //   _type: "Heading",
    //   _parent: "C",
    //   styles: "#styles:,text-2xl text-center",
    //   content: "No items",
    // },
  ],
  ...registerChaiBlockSchema({
    properties: {
      styles: stylesProp("grid gap-4 md:grid-cols-2 xl:grid-cols-3"),
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
        ui: { "ui:widget": "collectionSelect" },
      },
      sort: {
        title: "Sort by",
        type: "string",
        default: "",
        ui: { "ui:widget": "collectionSelect" },
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

export type RepeaterEmptyStateProps = {
  styles: ChaiStyles;
};

export const RepeaterEmptyState = ({
  children,
  blockProps,
  styles,
}: ChaiBlockComponentProps<RepeaterEmptyStateProps>) => {
  return React.createElement("div", { ...blockProps, ...styles }, children);
};

export const RepeaterEmptyStateConfig = {
  type: "RepeaterEmptyState",
  label: "Empty State",
  hidden: true,
  group: "basic",
  ...registerChaiBlockSchema({
    properties: { styles: stylesProp("p-5 flex items-center justify-center") },
  }),
  canAcceptBlock: () => true,
  canDelete: () => false,
  canMove: () => false,
  canDuplicate: () => false,
};

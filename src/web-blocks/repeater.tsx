import {
  ChaiBlockComponentProps,
  ChaiBlockDefinition,
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

export const Repeater = (props: ChaiBlockComponentProps<RepeaterProps>) => {
  const { children, tag, styles, blockProps, inBuilder, $loading } = props;
  let items = children;
  if (isEmpty(items) && inBuilder) {
    items = (
      <div className="col-span-3 flex items-center justify-center bg-orange-50 p-5 text-sm text-muted-foreground">
        Choose a collection to display items
      </div>
    );
  }
  return React.createElement(
    tag,
    { ...blockProps, ...styles },
    $loading
      ? Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-md bg-primary/10 p-5">
            <div className="h-6 w-1/2 rounded-md bg-primary/10"></div>
            <div className="mt-2 h-4 w-1/2 rounded-md bg-primary/10"></div>
          </div>
        ))
      : items,
  );
};

export const RepeaterConfig: Omit<ChaiBlockDefinition, "component"> = {
  type: "Repeater",
  label: "Repeater",
  icon: LoopIcon,
  group: "basic",
  dataProviderMode: "live",
  dataProviderDependencies: ["filter", "sort", "limit", "repeaterItems"],
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
        title: "Collection",
        type: "string",
        binding: "array",
        default: "",
        ui: {
          "ui:widget": "repeaterBinding",
          "ui:readonly": true,
        },
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
  inBuilder,
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
  if (!children && inBuilder) {
    return React.createElement(
      tag,
      { ...blockProps, ...styles },
      <div className="col-span-3 flex items-center justify-center bg-orange-50 p-5 text-sm text-muted-foreground">
        Add children to repeater item
      </div>,
    );
  }
  return React.createElement(tag, { ...blockProps, ...styles }, children);
};

export const RepeaterItemConfig: Omit<ChaiBlockDefinition, "component"> = {
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

export const RepeaterEmptyStateConfig: Omit<ChaiBlockDefinition, "component"> = {
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

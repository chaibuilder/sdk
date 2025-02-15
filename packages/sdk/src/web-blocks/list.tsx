import { ChaiBlockComponentProps, ChaiStyles, registerChaiBlockSchema, StylesProp } from "@chaibuilder/runtime";
import { RowsIcon } from "@radix-ui/react-icons";
import { get, isEmpty } from "lodash-es";
import * as React from "react";
import { cn } from "../core/functions/Functions.ts";
import EmptySlot from "./empty-slot.tsx";

export type ListBlockProps = {
  styles: ChaiStyles;
  listType: string;
  tag?: string;
};

const ListBlock = (props: ChaiBlockComponentProps<ListBlockProps>) => {
  const { blockProps, children, listType, styles, tag, inBuilder } = props;
  const className = cn(get(styles, "className", ""), listType);

  if (!children && isEmpty(styles?.className)) {
    return <EmptySlot inBuilder={inBuilder} />;
  }

  return React.createElement(
    tag ? tag : listType === "list-decimal" ? "ol" : "ul",
    { ...blockProps, ...styles, className },
    children,
  );
};

const Config = {
  type: "List",
  label: "web_blocks.list",
  icon: RowsIcon,
  category: "core",
  group: "basic",
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp(""),
      listType: {
        type: "string",
        title: "List Type",
        default: "list-none",
        oneOf: [
          { enum: ["list-none"], title: "List None" },
          { enum: ["list-disc"], title: "Disc" },
          { enum: ["list-decimal"], title: "Decimal" },
        ],
      },
    },
  }),
  canAcceptBlock: (blockType: string) => blockType === "ListItem",
  blocks: [
    { _type: "List", _id: "a", listType: "list-none", styles: "#styles:," },
    {
      _type: "ListItem",
      _id: "b",
      _parent: "a",
      styles: "#styles:,",
      content: "Item 1",
    },
    {
      _type: "ListItem",
      _id: "c",
      _parent: "a",
      styles: "#styles:,",
      content: "Item 2",
    },
    {
      _type: "ListItem",
      _id: "d",
      _parent: "a",
      styles: "#styles:,",
      content: "Item 3",
    },
  ],
};

export { ListBlock as Component, Config };

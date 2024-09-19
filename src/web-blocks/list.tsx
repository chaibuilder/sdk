import * as React from "react";
import { RowsIcon } from "@radix-ui/react-icons";
import { get, isEmpty } from "lodash-es";
import { SelectOption, Styles } from "@chaibuilder/runtime/controls";
import EmptySlot from "./empty-slot.tsx";
import { ChaiBlock } from "../core/types/ChaiBlock.ts";
import { cn } from "../core/functions/Functions.ts";
const ListBlock = (
  props: ChaiBlock & {
    blockProps: Record<string, string>;
    styles: Record<string, string>;
  },
) => {
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
  props: {
    styles: Styles({ default: "" }),
    listType: SelectOption({
      title: "web_blocks.list_type",
      default: "list-none",
      options: [
        { value: "list-none", title: "web_blocks.none" },
        { value: "list-disc", title: "web_blocks.disc" },
        { value: "list-decimal", title: "web_blocks.number" },
      ],
    }),
  },
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

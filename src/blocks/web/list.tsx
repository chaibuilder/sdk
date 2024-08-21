import * as React from "react";
import { ColumnsIcon, RowsIcon } from "@radix-ui/react-icons";
import { get, isEmpty } from "lodash-es";
import { MultilineText, SelectOption, Styles } from "@chaibuilder/runtime/controls";
import { registerChaiBlock } from "@chaibuilder/runtime";
import EmptySlot from "../empty-slot.tsx";
import { ChaiBlock } from "../../core/types/ChaiBlock.ts";
import { cn } from "../../core/functions/Functions.ts";

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

registerChaiBlock(ListBlock, {
  type: "List",
  label: "List",
  icon: RowsIcon,
  category: "core",
  group: "basic",
  props: {
    styles: Styles({ default: "" }),
    listType: SelectOption({
      title: "List type",
      default: "list-none",
      options: [
        { value: "list-none", title: "None" },
        { value: "list-disc", title: "Disc" },
        { value: "list-decimal", title: "Number" },
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
});

const ListItemBlock = (
  props: ChaiBlock & {
    content: string;
    blockProps: Record<string, string>;
    styles: Record<string, string>;
  },
) => {
  const { blockProps, content, styles, children, tag } = props;
  if (!children) {
    return React.createElement(tag || "li", {
      ...styles,
      ...blockProps,
      "data-ai-key": "content",
      dangerouslySetInnerHTML: { __html: content },
    });
  }
  return React.createElement(tag || "li", { ...styles, ...blockProps }, children);
};

registerChaiBlock(ListItemBlock, {
  type: "ListItem",
  label: "List Item",
  icon: ColumnsIcon,
  category: "core",
  group: "basic",
  props: {
    styles: Styles({ default: "" }),
    content: MultilineText({ title: "Content", default: "List item" }),
  },
  canAcceptBlock: (type: string) => type !== "ListItem" ,
  canBeNested: (type: string) => type === "List",
});

export default ListBlock;

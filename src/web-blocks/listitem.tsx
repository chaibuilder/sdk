import { ChaiBlock } from "../core/types/ChaiBlock.ts";
import * as React from "react";
import { ColumnsIcon } from "@radix-ui/react-icons";
import { MultilineText, Styles } from "@chaibuilder/runtime/controls";
import { t } from "./box.tsx";
export const ListItemBlock = (
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

const Config = {
  type: "ListItem",
  label: t("web_blocks.listitem"),
  icon: ColumnsIcon,
  category: "core",
  group: "basic",
  props: {
    styles: Styles({ default: "" }),
    content: MultilineText({ title: t("web_blocks.content"), default: "List item" }),
  },
  canAcceptBlock: (type: string) => type !== "ListItem",
  canBeNested: (type: string) => type === "List",
};

export { ListItemBlock as Component, Config };

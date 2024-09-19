import * as React from "react";
import { ButtonIcon } from "@radix-ui/react-icons";
import { Icon, Numeric, SelectOption, SingleLineText, Styles } from "@chaibuilder/runtime/controls";
import { ChaiBlock } from "../core/types/ChaiBlock.ts";
import { t } from "./box.tsx";

const Component = (
  block: ChaiBlock & {
    blockProps: Record<string, string>;
    styles: Record<string, string>;
  },
) => {
  const { blockProps, iconSize, icon, content, iconPos, styles, children } = block;
  const _icon = icon;

  const child = children || (
    <>
      <span data-ai-key="content">{content}</span>
      {_icon && (
        <div
          style={{ width: iconSize + "px" }}
          className={iconPos + " " + (iconPos === "order-first" ? "mr-2" : "ml-2") || ""}
          dangerouslySetInnerHTML={{ __html: _icon }}
        />
      )}
    </>
  );
  return React.createElement(
    "button",
    {
      ...blockProps,
      ...styles,
      type: "button",
    },
    child,
  );
};

const Config = {
  type: "Button",
  label: t("web_blocks.button"),
  category: "core",
  icon: ButtonIcon,
  group: "basic",
  props: {
    content: SingleLineText({ title: t("web_blocks.label"), default: t("web_blocks.default") }),
    styles: Styles({ default: "text-white bg-primary px-4 py-2 rounded flex items-center" }),
    icon: Icon({ title: t("web_blocks.icon"), default: `` }),
    iconSize: Numeric({ title: t("web_blocks.icon_size"), default: 24 }),
    iconPos: SelectOption({
      title: t("web_blocks.icon_position"),
      default: "order-last",
      options: [
        { title: t("web_blocks.start"), value: "order-first" },
        { title: t("web_blocks.end"), value: "order-last" },
      ],
    }),
  },
};
export { Component, Config };

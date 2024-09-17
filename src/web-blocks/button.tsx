import * as React from "react";
import { ButtonIcon } from "@radix-ui/react-icons";
import { Icon, Numeric, SelectOption, SingleLineText, Styles } from "@chaibuilder/runtime/controls";
import { ChaiBlock } from "../core/types/ChaiBlock.ts";
import { useTranslation } from "react-i18next";

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

const Config = () => {
  const { t } = useTranslation();

  return {
    type: "Button",
    label: t("Button"),
    category: "core",
    icon: ButtonIcon,
    group: "basic",
    props: {
      content: SingleLineText({ title: t("Label"), default: t("Button") }),
      styles: Styles({ default: "text-white bg-primary px-4 py-2 rounded-global flex items-center" }),
      icon: Icon({ title: t("Icon"), default: `` }),
      iconSize: Numeric({ title: t("Icon Size"), default: 24 }),
      iconPos: SelectOption({
        title: t("Icon Position"),
        default: "order-last",
        options: [
          { title: t("Start"), value: "order-first" },
          { title: t("End"), value: "order-last" },
        ],
      }),
    },
  };
};

export { Component, Config };

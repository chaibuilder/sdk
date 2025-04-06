"use client";
import { ChaiBlockComponentProps, ChaiStyles, registerChaiBlockSchema, StylesProp } from "@chaibuilder/runtime";
import { CopyIcon } from "@radix-ui/react-icons";
import { createElement } from "react";

export type CopyButtonProps = {
  content: string;
  icon: string;
  iconSize: number;
  styles: ChaiStyles;
};

const Component = (props: ChaiBlockComponentProps<CopyButtonProps>) => {
  const { blockProps, iconSize, icon, content, styles } = props;
  const _icon = icon;

  const child = (
    <>
      <span data-ai-key="content">{content}</span>
      {_icon && <div style={{ width: iconSize + "px" }} dangerouslySetInnerHTML={{ __html: _icon }} />}
    </>
  );

  const button = createElement(
    "button",
    {
      ...blockProps,
      ...styles,
      type: "button",
      "aria-label": content,
    },
    child,
  );

  return button;
};

const Config = {
  type: "CopyButton",
  description: "A copy button component",
  label: "Copy Button",
  category: "core",
  icon: CopyIcon,
  group: "basic",
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp("p-2 rounded-md flex items-center"),
      content: {
        type: "string",
        title: "Button label",
        default: "Button",
      },
      icon: {
        type: "string",
        title: "Icon",
        default:
          "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-copy'><path d='M8 17L19 8M8 17V7a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v10'/></svg>",
        ui: { "ui:widget": "icon" },
      },
      iconSize: {
        type: "number",
        title: "Icon size",
        default: 20,
      },
    },
  }),
  i18nProps: ["content"],
  aiProps: ["content"],
};
export { Component, Config };

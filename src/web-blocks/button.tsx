import * as React from "react";
import { ButtonIcon } from "@radix-ui/react-icons";
import { ChaiBlockComponentProps, registerChaiBlockSchema, StylesProp } from "@chaibuilder/runtime";

type ButtonProps = ChaiBlockComponentProps<{
  content: string;
  icon: string;
  iconSize: number;
  iconPos: "order-first" | "order-last";
}>;

const Component = (props: ButtonProps) => {
  const { blockProps, iconSize, icon, content, iconPos, styles, children } = props;
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
  label: "web_blocks.button",
  category: "core",
  icon: ButtonIcon,
  group: "basic",
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp("text-primary-foreground bg-primary px-4 py-2 rounded-lg flex items-center"),
      content: {
        type: "string",
        title: "Button label",
        default: "Button",
      },
      icon: {
        type: "string",
        title: "Icon",
        default: "",
        ui: { "ui:widget": "icon" },
      },
      iconSize: {
        type: "number",
        title: "Icon size",
        default: 24,
      },
      iconPos: {
        type: "string",
        title: "Icon position",
        default: "order-last",
        enum: ["order-first", "order-last"],
      },
    },
  }),
  i18nProps: ["content"],
  aiProps: ["content"],
  // props: {
  //   content: SingleLineText({ title: "web_blocks.label", default: "Button", ai: true, i18n: true }),
  //   styles: Styles({ default: "text-white bg-primary px-4 py-2 rounded-global flex items-center" }),
  //   icon: Icon({ title: "web_blocks.icon", default: `` }),
  //   iconSize: Numeric({ title: "web_blocks.icon_size", default: 24 }),
  //   iconPos: SelectOption({
  //     title: "web_blocks.icon_position",
  //     default: "order-last",
  //     options: [
  //       { title: "web_blocks.start", value: "order-first" },
  //       { title: "web_blocks.end", value: "order-last" },
  //     ],
  //   }),
  // },
};
export { Component, Config };

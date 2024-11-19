import * as React from "react";
import { isEmpty } from "lodash-es";
import { Link1Icon } from "@radix-ui/react-icons";
// import { Link, SingleLineText, Styles } from "@chaibuilder/runtime/controls";
import { ChaiBlockComponentProps, registerChaiBlockSchema, StylesProp, ChaiStyles } from "@chaibuilder/runtime";
// import { ChaiBlock } from "../core/types/ChaiBlock.ts";

export type LinkBlockProps = {
  styles: ChaiStyles;
  link: string;
  content: string;
  target: boolean;
};

const LinkBlock = (props: ChaiBlockComponentProps<LinkBlockProps>) => {
  const { blockProps, link, children, styles, inBuilder, content } = props;

  let emptyStyles = {};
  if (!children && isEmpty(content)) {
    emptyStyles = { minHeight: "50px", display: "flex", alignItems: "center", justifyContent: "center" };
  }

  if (inBuilder) {
    if (children) {
      return (
        <span {...blockProps} style={emptyStyles} {...styles}>
          {children}
        </span>
      );
    } else {
      return React.createElement(
        "span",
        {
          ...blockProps,
          ...styles,
          style: emptyStyles,
          "data-ai-key": "content",
        },
        content,
      );
    }
  }

  if (children) {
    return (
      <a href={link?.href || "#/"} target={link?.target} {...blockProps} {...styles}>
        {children}
      </a>
    );
  }

  return React.createElement(
    "a",
    {
      ...blockProps,
      ...styles,
      "data-ai-key": "content",
      href: link?.href || "#",
      target: link?.target || "_self",
    },
    content,
  );
};

const Config = {
  type: "Link",
  label: "Link",
  category: "core",
  icon: Link1Icon,
  group: "basic",
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp(""),
      content: {
        type: "string",
        default: "Link goes here",
        title: "Content",
      },
      link: {
        type: "object",
        title: "Link",
        default: {
          type: "page",
          href: "",
          target: "_self",
        },
        ui: {
          "ui:widget": "link",
        },
      },
      target: {
        title: "Open in new tab",
        type: "boolean",
        default: false,
      },
    },
  }),
  aiProps: ["content"],
  i18nProps: ["content"],
  canAcceptBlock: (type: string) => type !== "Link",
};

export { LinkBlock as Component, Config };

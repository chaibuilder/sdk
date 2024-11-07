import * as React from "react";
import { isEmpty } from "lodash-es";
import { Link1Icon } from "@radix-ui/react-icons";
import { Link, SingleLineText, Styles } from "@chaibuilder/runtime/controls";
import { ChaiBlock } from "../core/types/ChaiBlock.ts";

const LinkBlock = (
  props: ChaiBlock & {
    styles: any;
    link: any;
    inBuilder: boolean;
    blockProps: Record<string, string>;
    children: React.ReactNode;
  },
) => {
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
  props: {
    styles: Styles({ default: "" }),
    content: SingleLineText({ title: "Content", default: "", ai: true, i18n: true }),
    link: Link({
      title: "Link",
      default: { type: "collection", target: "_self", href: "" },
    }),
  },
  canAcceptBlock: (type: string) => type !== "Link",
};

export { LinkBlock as Component, Config };

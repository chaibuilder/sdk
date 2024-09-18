import * as React from "react";
import { isEmpty } from "lodash-es";
import { Link1Icon } from "@radix-ui/react-icons";
import { Link, SingleLineText, Styles } from "@chaibuilder/runtime/controls";
import EmptySlot from "./empty-slot.tsx";
import { ChaiBlock } from "../core/types/ChaiBlock.ts";
import { t } from "./box.tsx";

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

  if (!children && isEmpty(styles?.className) && isEmpty(content)) {
    return <EmptySlot inBuilder={inBuilder} />;
  }

  if (inBuilder) {
    if (children) {
      return (
        <span {...blockProps} {...styles}>
          {children}
        </span>
      );
    } else {
      return React.createElement("span", {
        ...blockProps,
        ...styles,
        dangerouslySetInnerHTML: { __html: content },
      });
    }
  }

  if (children) {
    return (
      <a href={link?.href || "#/"} target={link?.target} {...blockProps} {...styles}>
        {children}
      </a>
    );
  }

  return React.createElement("a", {
    ...blockProps,
    ...styles,
    "data-ai-key": "content",
    href: link?.href || "#",
    target: link?.target || "_self",
    dangerouslySetInnerHTML: { __html: content },
  });
};

const Config = {
  type: "Link",
  label: t("web_blocks.link"),
  category: "core",
  icon: Link1Icon,
  group: "basic",
  props: {
    styles: Styles({ default: "" }),
    content: SingleLineText({ title: t("web_blocks.content"), default: "" }),
    link: Link({
      title: t("web_blocks.link"),
      default: { type: "page", target: "_self", href: "#" },
    }),
  },
  canAcceptBlock: (type: string) => type !== "Link",
};

export { LinkBlock as Component, Config };

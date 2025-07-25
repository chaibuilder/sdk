import { ChaiBlockComponentProps, ChaiStyles, registerChaiBlockSchema, StylesProp } from "@chaibuilder/runtime";
import { Link1Icon } from "@radix-ui/react-icons";
import { isEmpty } from "lodash-es";
import { createElement } from "react";

export type LinkBlockProps = {
  styles: ChaiStyles;
  link: {
    href: string;
    target: string;
  };
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
        <span role="link" {...blockProps} style={emptyStyles} {...styles}>
          {children}
        </span>
      );
    } else {
      return createElement(
        "span",
        {
          ...blockProps,
          ...styles,
          style: emptyStyles,
          role: "link",
        },
        content,
      );
    }
  }

  if (children) {
    return (
      <a aria-label={content} href={link?.href || "#/"} target={link?.target} {...blockProps} {...styles}>
        {children}
      </a>
    );
  }

  return createElement(
    "a",
    {
      ...blockProps,
      ...styles,
      href: link?.href || "#",
      target: link?.target || "_self",
      "aria-label": content,
    },
    content,
  );
};

const Config = {
  type: "Link",
  description: "A link component",
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
        properties: {
          type: { type: "string" },
          href: { type: "string" },
          target: { type: "string" },
        },
        default: {
          type: "url",
          href: "",
          target: "_self",
        },
        ui: {
          "ui:field": "link",
        },
      },
      prefetchLink: {
        type: "boolean",
        default: false,
        title: "Prefetch Link",
      },
    },
  }),
  aiProps: ["content"],
  i18nProps: ["content"],
  canAcceptBlock: (type: string) => type !== "Link",
};

export { LinkBlock as Component, Config };

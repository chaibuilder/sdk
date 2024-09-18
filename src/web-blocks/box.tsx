import * as React from "react";
import { Image, SelectOption, Styles } from "@chaibuilder/runtime/controls";
import EmptySlot from "./empty-slot.tsx";
import i18next from "i18next";
export const t = (key: string) => i18next.t(key);

const Component = (
  props: any & {
    children: React.ReactNode;
    styles: any;
    tag: string;
    backgroundImage: string;
    blockProps: Record<string, string>;
  },
) => {
  const { blockProps, inBuilder, backgroundImage, children, tag = "div", styles } = props;
  let nestedChildren = children;
  if (!children) {
    nestedChildren = <EmptySlot inBuilder={inBuilder} />;
  }

  let cssStyles = {};
  if (backgroundImage) {
    cssStyles = { backgroundImage: `url(${backgroundImage})` };
  }

  return React.createElement(tag, { ...blockProps, ...styles, style: cssStyles }, nestedChildren);
};

const Config = {
  type: "Box",
  label: t("web_blocks.box"),
  category: "core",
  group: "basic",
  props: {
    styles: Styles({ default: "" }),
    tag: SelectOption({
      title: t("web_blocks.tag"),
      default: "div",
      options: [
        { value: "div", title: t("web_blocks.div") },
        { value: "header", title: t("web_blocks.header") },
        { value: "footer", title: t("web_blocks.footer") },
        { value: "section", title: t("web_blocks.section") },
        { value: "article", title: t("web_blocks.article") },
        { value: "aside", title: t("web_blocks.aside") },
        { value: "main", title: t("web_blocks.main") },
        { value: "nav", title: t("web_blocks.nav") },
        { value: "figure", title: t("web_blocks.figure") },
        { value: "details", title: t("web_blocks.details") },
        { value: "summary", title: t("web_blocks.summary") },
        { value: "dialog", title: t("web_blocks.dialog") },
        { value: "strike", title: t("web_blocks.strike") },
        { value: "caption", title: t("web_blocks.caption") },
        { value: "legend", title: t("web_blocks.legend") },
        { value: "figcaption", title: t("web_blocks.figcaption") },
        { value: "mark", title: t("web_blocks.mark") },
      ],
    }),
    backgroundImage: Image({ title: t("web_blocks.background_image") }),
  },
  canAcceptBlock: () => true,
};

export { Component, Config };

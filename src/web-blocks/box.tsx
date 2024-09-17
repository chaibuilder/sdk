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
      title: t("web_blocks.box.tag"),
      default: "div",
      options: [
        { value: "div", title: t("web_blocks.box.div") },
        { value: "header", title: t("web_blocks.box.header") },
        { value: "footer", title: t("web_blocks.box.footer") },
        { value: "section", title: t("web_blocks.box.section") },
        { value: "article", title: t("web_blocks.box.article") },
        { value: "aside", title: t("web_blocks.box.aside") },
        { value: "main", title: t("web_blocks.box.main") },
        { value: "nav", title: t("web_blocks.box.nav") },
        { value: "figure", title: t("web_blocks.box.figure") },
        { value: "details", title: t("web_blocks.box.details") },
        { value: "summary", title: t("web_blocks.box.summary") },
        { value: "dialog", title: t("web_blocks.box.dialog") },
        { value: "strike", title: t("web_blocks.box.strike") },
        { value: "caption", title: t("web_blocks.box.caption") },
        { value: "legend", title: t("web_blocks.box.legend") },
        { value: "figcaption", title: t("web_blocks.box.figcaption") },
        { value: "mark", title: t("web_blocks.box.mark") },
      ],
    }),
    backgroundImage: Image({ title: t("web_blocks.box.background_image") }),
  },
  canAcceptBlock: () => true,
};

export { Component, Config };

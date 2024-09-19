import * as React from "react";
import { isEmpty } from "lodash-es";
import { ImageIcon } from "@radix-ui/react-icons";
import { Checkbox, Numeric, SelectOption, SingleLineText, Styles } from "@chaibuilder/runtime/controls";
import EmptySlot from "./empty-slot.tsx";
import { addForcedClasses } from "./helper.ts";
import { ChaiBlockStyles, ChaiRenderBlockProps } from "../core/types/types.ts";


type LightBoxLinkProps = {
  href: string;
  hrefType: string;
  autoplay: boolean;
  maxWidth: number;
  backdropColor: string;
  content: string;
  galleryName: string;
  styles: ChaiBlockStyles;
};

const LightBoxLinkBlock = (props: ChaiRenderBlockProps<LightBoxLinkProps>) => {
  const { blockProps, children, styles, inBuilder, content, href } = props;
  const { hrefType, autoplay, maxWidth, backdropColor, galleryName } = props;
  const forcedStyles = addForcedClasses(styles, "cb-lightbox");
  if (!children && isEmpty(styles?.className) && isEmpty(content)) {
    return <EmptySlot inBuilder={inBuilder} />;
  }

  if (inBuilder) {
    if (children) {
      return (
        <span {...blockProps} {...forcedStyles}>
          {children}
        </span>
      );
    } else {
      return React.createElement("span", {
        ...blockProps,
        ...forcedStyles,
        dangerouslySetInnerHTML: { __html: content },
      });
    }
  }

  const lightBoxAttrs = {};
  lightBoxAttrs["data-vbtype"] = hrefType;
  if (autoplay) lightBoxAttrs["data-autoplay"] = "true";
  if (maxWidth) lightBoxAttrs["data-maxwidth"] = maxWidth + "px";
  if (backdropColor) lightBoxAttrs["data-overlay"] = backdropColor;
  if (galleryName) lightBoxAttrs["data-gall"] = galleryName;

  if (children) {
    return (
      <a {...lightBoxAttrs} href={href || "#/"} {...blockProps} {...forcedStyles}>
        {children}
      </a>
    );
  }

  return React.createElement("a", {
    ...blockProps,
    ...forcedStyles,
    ...lightBoxAttrs,
    href: href || "#",
    dangerouslySetInnerHTML: { __html: content },
  });
};
const Config = {
  type: "LightBoxLink",
  label: "web_blocks.lightbox_link",
  category: "core",
  icon: ImageIcon,
  group: "basic",
  props: {
    styles: Styles({ default: "" }),
    content: SingleLineText({ title: "web_blocks.content", default: "Link text or drop blocks inside" }),
    href: SingleLineText({ title: "web_blocks.href", default: "" }),
    hrefType: SelectOption({
      title: "web_blocks.type",
      default: "video",
      options: [
        { value: "video", title: "web_blocks.video" },
        { value: "iframe", title: "web_blocks.iframe" },
        { value: "inline", title: "web_blocks.inline" },
        { value: "ajax", title: "web_blocks.ajax" },
      ],
    }),
    autoplay: Checkbox({ title: "web_blocks.autoplay", default: false }),
    maxWidth: Numeric({ title: "web_blocks.max_width", default: "" }),
    backdropColor: SingleLineText({ title: "backdrop_color", default: "" }),
    galleryName: SingleLineText({ title: "web_blocks.gallery_name", default: "" }),
  },
  canAcceptBlock: (type: string) => type !== "Link" && type !== "LightBoxLink",
};

export { LightBoxLinkBlock as Component, Config };

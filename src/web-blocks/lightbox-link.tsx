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
  label: "Lightbox Link",
  category: "core",
  icon: ImageIcon,
  group: "basic",
  props: {
    styles: Styles({ default: "" }),
    content: SingleLineText({ title: "Content", default: "Link text or drop blocks inside", ai: true, i18n: true }),
    href: SingleLineText({ title: "Href", default: "" }),
    hrefType: SelectOption({
      title: "Type",
      default: "video",
      options: [
        { value: "video", title: "Video" },
        { value: "iframe", title: "Iframe" },
        { value: "inline", title: "Inline" },
        { value: "ajax", title: "Ajax" },
      ],
    }),
    autoplay: Checkbox({ title: "Autoplay", default: false }),
    maxWidth: Numeric({ title: "Max Width", default: "" }),
    backdropColor: SingleLineText({ title: "Backdrop Color", default: "" }),
    galleryName: SingleLineText({ title: "Gallery Name", default: "" }),
  },
  canAcceptBlock: (type: string) => type !== "Link" && type !== "LightBoxLink",
};

export { LightBoxLinkBlock as Component, Config };

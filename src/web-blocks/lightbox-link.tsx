import { StylesProp, registerChaiBlockSchema } from "@chaibuilder/runtime";
import { ImageIcon } from "@radix-ui/react-icons";
import { isEmpty } from "lodash-es";
import { createElement } from "react";
import { ChaiBlockStyles, ChaiRenderBlockProps } from "../core/types/types.ts";
import EmptySlot from "./empty-slot.tsx";
import { addForcedClasses } from "./helper.ts";

export type LightBoxLinkProps = {
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
  const forcedStyles = addForcedClasses(styles, "cb-lightbox vbox-item");
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
      return createElement("span", {
        ...blockProps,
        ...forcedStyles,
        dangerouslySetInnerHTML: { __html: content },
      });
    }
  }

  const lightBoxAttrs = {};
  if (hrefType !== "image") lightBoxAttrs["data-vbtype"] = hrefType;
  if (autoplay) lightBoxAttrs["data-autoplay"] = "true";
  if (maxWidth) lightBoxAttrs["data-maxwidth"] = maxWidth + "px";
  if (backdropColor) lightBoxAttrs["data-overlay"] = backdropColor;
  if (galleryName) lightBoxAttrs["data-gall"] = galleryName;

  if (children) {
    return (
      <a aria-label={content} {...lightBoxAttrs} href={href || "#/"} {...blockProps} {...forcedStyles}>
        {children}
      </a>
    );
  }

  return createElement("a", {
    ...blockProps,
    ...forcedStyles,
    ...lightBoxAttrs,
    href: href || "#",
    dangerouslySetInnerHTML: { __html: content },
    "aria-label": content,
  });
};
const Config = {
  type: "LightBoxLink",
  label: "Lightbox Link",
  category: "core",
  icon: ImageIcon,
  group: "basic",

  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp(""),
      content: {
        type: "string",
        title: "Content",
        default: "Link text or drop blocks inside",
      },
      hrefType: {
        type: "string",
        title: "Type",
        default: "image",
        enum: ["image", "video", "iframe", "inline", "ajax"],
        enumNames: ["Image", "Video", "Iframe", "Inline", "Ajax"],
      },
      href: {
        type: "string",
        title: "Href",
        default: "",
      },
      autoplay: {
        type: "boolean",
        title: "Autoplay (Video only)",
        default: false,
      },

      maxWidth: {
        type: "number",
        title: "Max Width",
        default: "",
      },
      backdropColor: {
        type: "string",
        title: "Backdrop Color",
        default: "",
      },
      galleryName: {
        type: "string",
        title: "Gallery Name",
        default: "",
      },
    },
    dependencies: {
      autoplay: ["hrefType", "video"],
    },
  }),
  i18nProps: ["content"],
  aiProps: ["content"],
  canAcceptBlock: (type: string) => type !== "Link" && type !== "LightBoxLink",
};

export { LightBoxLinkBlock as Component, Config };

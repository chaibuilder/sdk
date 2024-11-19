import * as React from "react";
import { isEmpty } from "lodash-es";
import { ImageIcon } from "@radix-ui/react-icons";
import EmptySlot from "./empty-slot.tsx";
import { addForcedClasses } from "./helper.ts";
import { ChaiBlockStyles, ChaiRenderBlockProps } from "../core/types/types.ts";
import { StylesProp, registerChaiBlockSchema } from "@chaibuilder/runtime";

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

  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp(""),
      content: {
        type: "string",
        title: "Content",
        default: "Link text or drop blocks inside",
      },
      href: {
        type: "string",
        title: "Href",
        default: "",
      },
      hrefType: {
        type: "string",
        title: "Type",
        default: "video",
        oneOf: [
          {
            type: "string",
            title: "Video",
            enum: ["video"],
          },
          {
            type: "string",
            title: "Iframe",
            enum: ["iframe"],
          },
          {
            type: "string",
            title: "Inline",
            enum: ["inline"],
          },
          {
            type: "string",
            title: "Ajax",
            enum: ["ajax"],
          },
        ],
      },
      autoplay: {
        type: "boolean",
        title: "Autoplay",
        default: false,
        dependencies: {
          hrefType: ["video"]
        }
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
  }),
  i18nProps: ["content"],
  aiProps: ["content"],
  canAcceptBlock: (type: string) => type !== "Link" && type !== "LightBoxLink",
};

export { LightBoxLinkBlock as Component, Config };

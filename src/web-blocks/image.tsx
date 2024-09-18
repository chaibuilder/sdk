import * as React from "react";
import { ImageIcon } from "@radix-ui/react-icons";
import { Image, SingleLineText, Styles } from "@chaibuilder/runtime/controls";
import { isEmpty } from "lodash-es";
import EmptySlot from "./empty-slot.tsx";
import { ChaiBlock } from "../core/types/ChaiBlock.ts";
import { t } from "./box";

const ImageBlock = (
  block: ChaiBlock & {
    blockProps: Record<string, string>;
    height: number;
    width: number;
    alt: string;
    styles: Record<string, string>;
  },
) => {
  const { blockProps, image, styles, alt, height, width } = block;

  if (isEmpty(image)) return <EmptySlot className="h-36" />;

  return React.createElement("img", {
    ...blockProps,
    ...styles,
    src: image,
    alt: alt,
    loading: "lazy",
    height: height,
    width: width,
  });
};

const Config = {
  type: "Image",
  label: t("web_blocks.image"),
  category: "core",
  icon: ImageIcon,
  group: "media",
  props: {
    styles: Styles({ default: "" }),
    image: Image({
      title: "Image",
      default: "https://fakeimg.pl/400x200?text=Choose&font=bebas",
    }),
    alt: SingleLineText({ title: t("web_blocks.alt"), default: "" }),
    width: SingleLineText({ title: t("web_blocks.width"), default: "" }),
    height: SingleLineText({ title: t("web_blocks.height"), default: "" }),
  },
};

export { ImageBlock as Component, Config };

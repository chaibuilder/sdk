import * as React from "react";
import { ImageIcon } from "@radix-ui/react-icons";
import { Checkbox, Image, SingleLineText, Styles } from "@chaibuilder/runtime/controls";
import { isEmpty } from "lodash-es";
import EmptySlot from "./empty-slot.tsx";
import { ChaiBlock } from "../core/types/ChaiBlock.ts";

const ImageBlock = (
  block: ChaiBlock & {
    blockProps: Record<string, string>;
    height: number;
    width: number;
    alt: string;
    styles: Record<string, string>;
    lazyLoading: boolean;
  },
) => {
  const { blockProps, image, styles, alt, height, width, lazyLoading } = block;

  if (isEmpty(image)) return <EmptySlot className="h-36" />;

  return React.createElement("img", {
    ...blockProps,
    ...styles,
    src: image,
    alt: alt,
    loading: lazyLoading ? "lazy" : "eager",
    height: height,
    width: width,
  });
};

const Config = {
  type: "Image",
  label: "web_blocks.image",
  category: "core",
  icon: ImageIcon,
  group: "media",
  props: {
    styles: Styles({ default: "" }),
    image: Image({
      title: "Image",
      default: "https://fakeimg.pl/400x200?text=Choose&font=bebas",
    }),
    alt: SingleLineText({ title: "web_blocks.alt", default: "" }),
    width: SingleLineText({ title: "web_blocks.width", default: "" }),
    height: SingleLineText({ title: "web_blocks.height", default: "" }),
    lazyLoading: Checkbox({ title: "Lazy Load", default: true }),
  },
};

export { ImageBlock as Component, Config };

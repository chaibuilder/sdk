import * as React from "react";
import { ImageIcon } from "@radix-ui/react-icons";
import { isEmpty } from "lodash-es";
import EmptySlot from "./empty-slot.tsx";
import { ChaiBlockComponentProps, registerChaiBlockSchema, StylesProp, ChaiStyles } from "@chaibuilder/runtime";

export type ImageBlockProps = {
  styles: ChaiStyles;
  image: string;
  alt: string;
  width: number;
  height: number;
  lazyLoading: boolean;
};

const ImageBlock = (props: ChaiBlockComponentProps<ImageBlockProps>) => {
  const { blockProps, image, styles, alt, height, width, lazyLoading } = props;

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
  label: "Image",
  category: "core",
  icon: ImageIcon,
  group: "media",
  // props: {
  //   styles: Styles({ default: "" }),
  //   image: Image({
  //     title: "Image",
  //     default: "https://fakeimg.pl/400x200?text=Choose&font=bebas",
  //   }),
  //   alt: SingleLineText({ title: "Alt text", default: "", ai: true, i18n: true }),
  //   width: SingleLineText({ title: "Width", default: "" }),
  //   height: SingleLineText({ title: "Height", default: "" }),
  //   lazyLoading: Checkbox({ title: "Lazy Load", default: true }),
  // },
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp(""),
      image: {
        type: "string",
        title: "Image",
        default: "https://fakeimg.pl/400x200?text=Choose&font=bebas",
        ui: {
          "ui:widget": "image",
          "ui:options": {
            buttonText: "Replace image",
            placeholderText: "OR",
            inputPlaceholder: "https://fakeimg.pl",
          },
        },
      },
      alt: {
        type: "string",
        title: "Alt text",
        default: "",
        ui: {
          "ui:placeholder": "Enter Here",
        },
      },
      height: {
        type: "number",
        title: "Height",
        default: null,
        ui: {
          "ui:placeholder": "Enter Here",
        },
      },
      width: {
        type: "number",
        title: "Width",
        default: null,
        ui: {
          "ui:placeholder": "Enter Here",
        },
      },
      lazyLoading: {
        type: "boolean",
        title: "Lazy Load",
        default: true,
      },
    },
  }),
  aiProps: ["alt"],
  i18nProps: ["alt"],
};

export { ImageBlock as Component, Config };

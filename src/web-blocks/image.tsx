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
  mobileImage: string;
  mobileWidth: number;
  mobileHeight: number;
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
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp(""),
      image: {
        type: "string",
        title: "Image",
        default: "https://fakeimg.pl/400x200?text=Choose&font=bebas",
        ui: { "ui:widget": "image" },
      },
      alt: {
        type: "string",
        title: "Alt text",
        default: "",
        ui: { "ui:placeholder": "Enter  alt text" },
      },
      lazyLoading: {
        type: "boolean",
        title: "Lazy Load",
        default: true,
      },
      width: {
        type: "number",
        title: "Width",
        default: "",
        ui: { "ui:placeholder": "Enter width" },
      },
      height: {
        type: "number",
        title: "Height",
        default: "",
        ui: { "ui:placeholder": "Enter height" },
      },

      mobileImage: {
        type: "string",
        title: "Mobile Image",
        default: "",
        ui: { "ui:widget": "image" },
      },
      mobileWidth: {
        type: "number",
        title: "Mobile Width",
        default: "",
        ui: { "ui:placeholder": "Enter width" },
      },
      mobileHeight: {
        type: "number",
        title: "Mobile Height",
        default: "",
        ui: { "ui:placeholder": "Enter height" },
      },
    },
  }),
  aiProps: ["alt"],
  i18nProps: ["alt"],
};

export { ImageBlock as Component, Config };

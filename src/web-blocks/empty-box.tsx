import * as React from "react";
import { ChaiBlockComponentProps, ChaiStyles, StylesProp, registerChaiBlockSchema } from "@chaibuilder/runtime";

export type EmptyBoxProps = {
  styles: ChaiStyles;
  backgroundImage: string;
};

const EmptyBox = (props: ChaiBlockComponentProps<EmptyBoxProps>) => {
  const { blockProps, styles, backgroundImage } = props;
  let cssStyles = {};
  if (backgroundImage) {
    cssStyles = { backgroundImage: `url(${backgroundImage})` };
  }
  return React.createElement("div", { ...blockProps, ...styles, style: cssStyles });
};

const Config = {
  type: "EmptyBox",
  label: "Empty Box",
  category: "core",
  group: "basic",
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp(""),
      backgroundImage: {
        type: "string",
        title: "Background Image",
        default: "",
        ui: { "ui:widget": "image" },
      },
    },
  }),
};

export { EmptyBox as Component, Config };

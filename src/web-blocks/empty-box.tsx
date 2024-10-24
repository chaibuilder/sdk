import * as React from "react";
import { Image, Styles } from "@chaibuilder/runtime/controls";

const EmptyBox = React.memo(
  (
    props: any & {
      styles: any;
      blockProps: Record<string, string>;
    },
  ) => {
    const { blockProps, styles, backgroundImage } = props;
    let cssStyles = {};
    if (backgroundImage) {
      cssStyles = { backgroundImage: `url(${backgroundImage})` };
    }
    return React.createElement("div", { ...blockProps, ...styles, style: cssStyles });
  },
);

const Config = {
  type: "EmptyBox",
  label: "web_blocks.empty_box",
  category: "core",
  group: "basic",
  props: {
    styles: Styles({ default: "" }),
    backgroundImage: Image({ title: "Background Image" }),
  },
};

export { EmptyBox as Component, Config };

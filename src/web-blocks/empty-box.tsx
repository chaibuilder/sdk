import * as React from "react";
import { Styles } from "@chaibuilder/runtime/controls";

const EmptyBox = React.memo(
  (
    props: any & {
      styles: any;
      blockProps: Record<string, string>;
    },
  ) => {
    const { blockProps, styles } = props;
    return React.createElement("div", { ...blockProps, ...styles });
  },
);

const Config = {
  type: "EmptyBox",
  label: "web_blocks.empty_box",
  category: "core",
  group: "basic",
  props: {
    styles: Styles({ default: "" }),
  },
};

export { EmptyBox as Component, Config };

import * as React from "react";
import { Styles } from "@chaibuilder/runtime/controls";
import { registerChaiBlock } from "@chaibuilder/runtime";

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

registerChaiBlock(EmptyBox, {
  type: "EmptyBox",
  label: "Empty Box",
  category: "core",
  group: "basic",
  props: {
    styles: Styles({ default: "" }),
  },
  canAcceptBlock: () => false,
});

export default EmptyBox;

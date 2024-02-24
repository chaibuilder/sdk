import * as React from "react";
import { Styles } from "@chaibuilder/runtime/controls";
import { registerChaiBlock } from "@chaibuilder/runtime";
import { SpaceBetweenVerticallyIcon } from "@radix-ui/react-icons";
import { ChaiBlock } from "../types/ChaiBlock.ts";

const LineBreakComponent = (props: ChaiBlock & { styles: any; blockProps: Record<string, string> }) => {
  const { blockProps, styles } = props;
  return React.createElement("br", { ...blockProps, ...styles });
};

registerChaiBlock(LineBreakComponent, {
  type: "LineBreak",
  label: "Line Break",
  category: "core",
  group: "basic",
  icon: SpaceBetweenVerticallyIcon,
  props: {
    styles: Styles({ default: "" }),
  },
});

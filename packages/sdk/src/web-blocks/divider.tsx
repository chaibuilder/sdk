import { ChaiBlockComponentProps, ChaiStyles, registerChaiBlockSchema, StylesProp } from "@chaibuilder/runtime";
import { DividerHorizontalIcon } from "@radix-ui/react-icons";
import { createElement } from "react";

export type DividerBlockProps = {
  styles: ChaiStyles;
};

const DividerBlock = (props: ChaiBlockComponentProps<DividerBlockProps>) => {
  const { blockProps, styles } = props;
  return createElement("hr", { ...styles, ...blockProps });
};

const Config = {
  type: "Divider",
  label: "web_blocks.divider",
  category: "core",
  icon: DividerHorizontalIcon,
  group: "basic",
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp("bg-gray-900 h-0.5 py-2 my-1"),
    },
  }),
};

export { DividerBlock as Component, Config };

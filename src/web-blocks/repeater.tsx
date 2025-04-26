import { ChaiBlockComponentProps, ChaiStyles, registerChaiBlockSchema, stylesProp } from "@chaibuilder/runtime";
import { LoopIcon } from "@radix-ui/react-icons";
import * as React from "react";

export type RepeaterProps = {
  items?: any[];
  tag: string;
  styles: ChaiStyles;
};

export const Repeater = ({ items, tag, blockProps, styles }: ChaiBlockComponentProps<RepeaterProps>) => {
  return React.createElement(tag, { ...blockProps, ...styles }, items);
};

export const RepeaterConfig = {
  type: "Repeater",
  label: "Repeater",
  icon: LoopIcon,
  group: "basic",
  ...registerChaiBlockSchema({
    properties: {
      tag: {
        title: "Tag",
        type: "string",
        default: "ul",
        enum: ["div", "ul", "ol"],
      },
      styles: stylesProp(""),
      data: {
        title: "Data",
        type: "string",
        binding: "array",
        default: "",
      },
    },
  }),
  canAcceptBlock: (type: string) => type !== "Repeater",
};

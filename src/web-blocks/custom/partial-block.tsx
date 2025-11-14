import { ChaiBlockComponentProps, ChaiStyles, registerChaiBlockSchema, StylesProp } from "@chaibuilder/runtime";
import { FrameIcon } from "@radix-ui/react-icons";
import * as React from "react";

export type PartialBlockProps = {
  partialBlockId: string;
  style?: ChaiStyles;
  wrapperType?: "none" | "div";
};

const Component = (props: ChaiBlockComponentProps<PartialBlockProps>) => {
  const { blockProps, inBuilder, children, partialBlockId, style ,wrapperType="none" } = props;
  if (inBuilder && !partialBlockId) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-y-1 rounded-lg bg-gray-100 py-4 dark:bg-gray-800"
        {...blockProps}>
        <h1>Partial Block - {partialBlockId}</h1>
        <p>Choose a block from the sidebar to add it to this page.</p>
      </div>
    );
  }
  if(wrapperType === "div") {
    return React.createElement("div", { ...blockProps, ...style }, children);
  }
  return React.createElement("span", { ...blockProps }, children);
};

const Config = {
  type: "PartialBlock",
  description: "A partial block component. Partial blocks are global blocks that can be used in multiple pages.",
  label: "Partial Block",
  icon: FrameIcon,
  category: "core",
  group: "basic",
  hidden: true,
  ...registerChaiBlockSchema({
    properties: {
      style : StylesProp(""), 
      partialBlockId: {
        type: "string",
        title: "Partial Block",
        default: "",
        ui: { "ui:widget": "hidden" },
      },
      wrapperType: {
        type: "string",
        title: "Wrapper Type",
        default: "none",
        enum: ["none", "div"],
        enumNames: ["Without Wrapper", "Div Wrapper"],
      },
    },
  }),
};

export { Component as PartialBlock, Config as PartialBlockConfig };

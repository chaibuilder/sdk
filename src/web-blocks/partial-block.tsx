import { ChaiBlockComponentProps, registerChaiBlockSchema } from "@chaibuilder/runtime";
import { GlobeIcon } from "lucide-react";
import * as React from "react";

export type PartialBlockProps = {
  partialBlockId: string;
};

const Component = (props: ChaiBlockComponentProps<PartialBlockProps>) => {
  const { blockProps, inBuilder, children, partialBlockId } = props;
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
  return React.createElement("span", { ...blockProps }, children);
};

const Config = {
  type: "PartialBlock",
  label: "Partial Block",
  icon: GlobeIcon,
  category: "core",
  group: "basic",
  hidden: true,
  ...registerChaiBlockSchema({
    properties: {
      partialBlockId: {
        type: "string",
        title: "Partial Block",
        default: "",
        ui: { "ui:widget": "hidden" },
      },
    },
  }),
};

export { Component as PartialBlock, Config as PartialBlockConfig };

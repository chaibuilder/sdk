import * as React from "react";
import { GlobeIcon } from "lucide-react";
import { SingleLineText } from "@chaibuilder/runtime/controls";

const Component = (
  props: any & {
    children: React.ReactNode;
    blockProps: Record<string, string>;
    globalBlock?: string;
  },
) => {
  const { blockProps, inBuilder, children, globalBlock } = props;
  if (inBuilder && !globalBlock) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-y-1 rounded-lg bg-gray-100 py-4 dark:bg-gray-800"
        {...blockProps}>
        <h1>Global Block - {globalBlock}</h1>
        <p>Choose a block from the sidebar to add it to this page.</p>
      </div>
    );
  }
  return React.createElement("div", { ...blockProps }, children);
};

const Config = {
  type: "GlobalBlock",
  label: "Global Block",
  icon: GlobeIcon,
  category: "core",
  group: "advanced",
  props: {
    globalBlock: SingleLineText({ title: "global block", default: "", hidden: true }),
  },
};

export { Component, Config };

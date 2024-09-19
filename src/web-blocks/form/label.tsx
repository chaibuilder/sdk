import { ChaiBlock } from "../../core/types/ChaiBlock.ts";
import * as React from "react";
import { LetterCaseToggleIcon } from "@radix-ui/react-icons";
import { SingleLineText, Styles } from "@chaibuilder/runtime/controls";

export const LabelBlock = (
  props: ChaiBlock & {
    children: React.ReactNode;
    styles: any;
    content: string;
    blockProps: Record<string, string>;
  },
) => {
  const { blockProps, content, styles, children } = props;
  const labelProps = { ...styles, ...blockProps };

  if (children) return React.createElement("label", labelProps, children);
  return React.createElement("label", {
    ...labelProps,
    dangerouslySetInnerHTML: { __html: content },
  });
};
const Config = {
  type: "Label",
  label: "web_blocks.label",
  category: "core",
  icon: LetterCaseToggleIcon,
  group: "form",
  props: {
    styles: Styles({ default: "" }),
    content: SingleLineText({ title: "web_blocks.label", default: "Label", ai: { html: false } }),
  },
};

export { LabelBlock as Component, Config };

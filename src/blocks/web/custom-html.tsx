import * as React from "react";
import { CodeIcon } from "@radix-ui/react-icons";
import { registerChaiBlock } from "@chaibuilder/runtime";
import { Code, Styles } from "@chaibuilder/runtime/controls";
import { ChaiBlock } from "../../core/types/ChaiBlock.ts";

const CustomHTMLBlock = React.memo(
  (
    props: ChaiBlock & {
      blockProps: Record<string, string>;
      styles: Record<string, string>;
    },
  ) => {
    const { blockProps, styles, htmlCode, inBuilder } = props;
    //remove all script tags from htmlCode
    const htmlCodeWithoutScriptTags = htmlCode.replace(/<script.*?>.*?<\/script>/g, "");
    return (
      <div className={"relative"}>
        {inBuilder ? <div {...blockProps} {...styles} className="absolute z-20 h-full w-full" /> : null}
        {React.createElement("div", {
          ...styles,
          dangerouslySetInnerHTML: { __html: inBuilder ? htmlCodeWithoutScriptTags : htmlCode },
        })}
      </div>
    );
  },
);

registerChaiBlock(CustomHTMLBlock, {
  type: "CustomHTML",
  label: "Custom HTML",
  category: "core",
  icon: CodeIcon,
  group: "advanced",
  props: {
    styles: Styles({ default: "" }),
    htmlCode: Code({
      title: "HTML Code",
      default: "<div><p>HTML Snippet goes here...</p></div>",
      placeholder: "Enter custom HTML code here",
    }),
  },
});

export default CustomHTMLBlock;

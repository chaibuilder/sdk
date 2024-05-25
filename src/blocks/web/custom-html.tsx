import * as React from "react";
import { CodeIcon } from "@radix-ui/react-icons";
import { registerChaiBlock } from "@chaibuilder/runtime";
import { MultilineText, Styles } from "@chaibuilder/runtime/controls";
import { ChaiBlock } from "../../core/types/ChaiBlock.ts";

const CustomHTMLBlock = React.memo(
  (
    props: ChaiBlock & {
      blockProps: Record<string, string>;
      styles: Record<string, string>;
    },
  ) => {
    const { blockProps, styles, content, inBuilder } = props;
    return (
      <div className={"relative"}>
        {inBuilder ? <div {...blockProps} {...styles} className="absolute h-full w-full z-20" /> : null}
        {React.createElement("div", {
          ...styles,
          dangerouslySetInnerHTML: { __html: content },
        })}
      </div>
    );
  },
);

registerChaiBlock(CustomHTMLBlock as React.FC<any>, {
  type: "CustomHTML",
  label: "CustomHTML",
  category: "core",
  icon: CodeIcon,
  group: "basic",
  props: {
    styles: Styles({ default: "" }),
    content: MultilineText({
      title: "HTML Content",
      default: "<div><p>HTML Snippet goes here...</p></div>",
      placeholder: "Enter custom HTML code here",
    }),
  },
});

export default CustomHTMLBlock;

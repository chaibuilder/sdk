import * as React from "react";
import { CodeIcon } from "@radix-ui/react-icons";
import { Code, Styles } from "@chaibuilder/runtime/controls";
import { ChaiBlock } from "../core/types/ChaiBlock.ts";


const CustomHTMLBlock = (
  props: ChaiBlock & {
    blockProps: Record<string, string>;
    styles: Record<string, string>;
  },
) => {
  const { blockProps, styles, htmlCode, inBuilder } = props;
  return inBuilder ? (
    <div className={"relative"}>
      {inBuilder ? <div {...blockProps} {...styles} className="absolute z-20 h-full w-full" /> : null}
      {React.createElement("div", {
        ...styles,
        dangerouslySetInnerHTML: { __html: htmlCode.replace(/<script.*?>.*?<\/script>/g, "") },
      })}
    </div>
  ) : (
    React.createElement("div", {
      ...blockProps,
      ...styles,
      dangerouslySetInnerHTML: { __html: htmlCode },
    })
  );
};

const Config = {
  type: "CustomHTML",
  label: "web_blocks.custom_html",
  category: "core",
  icon: CodeIcon,
  group: "advanced",
  props: {
    styles: Styles({ default: "" }),
    htmlCode: Code({
      title: "web_blocks.html_code",
      default: "<div><p>" + "web_blocks.default_snippet" + "</p></div>",
      placeholder: "web_blocks.placeholder",
    }),
  },
  canAcceptBlock: () => false,
};

export { CustomHTMLBlock as Component, Config };

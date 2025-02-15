import { ChaiBlockComponentProps, ChaiStyles, registerChaiBlockSchema, StylesProp } from "@chaibuilder/runtime";
import { CodeIcon } from "@radix-ui/react-icons";
import * as React from "react";

const CustomHTMLBlock = (props: ChaiBlockComponentProps<{ htmlCode: string; styles: ChaiStyles }>) => {
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
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp(""),
      htmlCode: {
        type: "string",
        default: "<div><p>Enter your HTML code here...</p></div>",
        ui: { "ui:widget": "code" },
      },
    },
  }),
};

export { CustomHTMLBlock as Component, Config };
export type CustomHTMLBlockProps = { htmlCode: string; styles: ChaiStyles };

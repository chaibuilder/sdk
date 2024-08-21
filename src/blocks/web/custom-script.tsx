import * as React from "react";
import { CodeIcon } from "@radix-ui/react-icons";
import { registerChaiBlock } from "@chaibuilder/runtime";
import { List, MultilineText, SingleLineText } from "@chaibuilder/runtime/controls";
import { ChaiBlock } from "../../core/types/ChaiBlock.ts";

const CustomScript = React.memo(
  (
    props: ChaiBlock & {
      scriptSrc: { src: string }[];
      script: string;
    },
  ) => {
    const { script, inBuilder } = props;
    if (inBuilder) return null;
    return <script dangerouslySetInnerHTML={{ __html: script }}></script>;
  },
);

registerChaiBlock(CustomScript, {
  type: "CustomScript",
  label: "Custom Script",
  category: "core",
  icon: CodeIcon,
  group: "advanced",
  props: {
    scriptSrc: List({
      title: "CDN Scripts",
      default: [],
      itemProperties: {
        src: SingleLineText({ title: "Src url", default: "" }),
      },
    }),
    script: MultilineText({
      title: "Script",
      default: "",
      placeholder: "<script>console.log('Hello, world!');</script>",
    }),
  },
});

export default CustomScript;

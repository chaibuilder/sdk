import * as React from "react";
import { registerChaiBlock } from "@chaibuilder/runtime";
import { Code } from "@chaibuilder/runtime/controls";
import { ChaiBlock } from "../../core/types/ChaiBlock.ts";
import { DiJavascript } from "react-icons/di";

const CustomScript = React.memo(
  (
    props: ChaiBlock & {
      script: string;
    },
  ) => {
    const { script, inBuilder } = props;
    if (inBuilder) return null;
    return <div dangerouslySetInnerHTML={{ __html: script }}></div>;
  },
);

registerChaiBlock(CustomScript, {
  type: "CustomScript",
  label: "Custom Script",
  category: "core",
  icon: DiJavascript,
  group: "advanced",
  props: {
    script: Code({
      title: "Script",
      default: "",
      placeholder: "<script>console.log('Hello, world!');</script>",
    }),
  },
});

export default CustomScript;

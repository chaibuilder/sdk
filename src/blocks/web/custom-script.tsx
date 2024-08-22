import * as React from "react";
import { registerChaiBlock } from "@chaibuilder/runtime";
import { Code } from "@chaibuilder/runtime/controls";
import { ChaiBlock } from "../../core/types/ChaiBlock.ts";
import { DiJavascript } from "react-icons/di";
import EmptySlot from "../empty-slot.tsx";

const CustomScript = React.memo(
  (
    props: ChaiBlock & {
      script: string;
    },
  ) => {
    const { script, inBuilder, blockProps } = props;
    if (inBuilder)
      return (
        <div {...blockProps}>
          <EmptySlot />
        </div>
      );
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

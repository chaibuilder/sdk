import { Code } from "@chaibuilder/runtime/controls";
import { ChaiBlock } from "../core/types/ChaiBlock.ts";
import { DiJavascript } from "react-icons/di";
import { t } from "./box.tsx";

const CustomScript = (
  props: ChaiBlock & {
    script: string;
  },
) => {
  const { scripts, inBuilder, blockProps } = props;
  if (inBuilder) return <div {...blockProps}></div>;
  return <div dangerouslySetInnerHTML={{ __html: scripts }}></div>;
};

const Config = {
  type: "CustomScript",
  label: t("web_blocks.custom_script"),
  category: "core",
  icon: DiJavascript,
  group: "advanced",
  props: {
    scripts: Code({
      title: "Script",
      default: "",
      placeholder: "<script>console.log('Hello, world!');</script>",
    }),
  },
  canAcceptBlock: () => false,
};

export { CustomScript as Component, Config };

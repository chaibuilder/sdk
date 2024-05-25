import { MultilineText } from "@chaibuilder/runtime/controls";
import { registerChaiBlock } from "@chaibuilder/runtime";
import { SpaceBetweenVerticallyIcon } from "@radix-ui/react-icons";
import { ChaiBlock } from "../../core/types/ChaiBlock.ts";

const RawTextBlock = (
  props: ChaiBlock & {
    content: string;
    inBuilder: boolean;
    blockProps: Record<string, string>;
  },
) => {
  if (props.inBuilder) {
    return (
      <span className={"inline"} {...props.blockProps}>
        {props.content}
      </span>
    );
  }
  return `${props.content}`;
};

registerChaiBlock(RawTextBlock, {
  type: "Text",
  label: "Text",
  hidden: true,
  category: "core",
  group: "basic",
  icon: SpaceBetweenVerticallyIcon,
  props: {
    content: MultilineText({ title: "Content", defaultValue: "" }),
  },
});

export default RawTextBlock;

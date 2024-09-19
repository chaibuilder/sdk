import { MultilineText } from "@chaibuilder/runtime/controls";
import { SpaceBetweenVerticallyIcon } from "@radix-ui/react-icons";
import { ChaiBlock } from "../core/types/ChaiBlock.ts";

const RawTextBlock = (
  props: ChaiBlock & {
    content: string;
    inBuilder: boolean;
    blockProps: Record<string, string>;
  },
) => {
  if (props.inBuilder || props.forceWrapper) {
    return (
      <span data-ai-key={"content"} {...props.blockProps}>
        {props.content}
      </span>
    );
  }
  return `${props.content}`;
};

const Config = {
  type: "Text",
  label: "web_blocks.text",
  hidden: true,
  category: "core",
  group: "typography",
  icon: SpaceBetweenVerticallyIcon,
  props: {
    content: MultilineText({ title: "web_blocks.content", defaultValue: "" }),
  },
};

export { RawTextBlock as Component, Config };

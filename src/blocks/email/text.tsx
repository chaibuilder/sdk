import { Text } from "@react-email/components";
import { registerChaiBlock } from "@chaibuilder/runtime";
import { SingleLineText, Styles } from "@chaibuilder/runtime/controls";
import { TextIcon } from "@radix-ui/react-icons";

const TextBlock = ({ blockProps, styles, content }: any) => {
  return (
    <Text {...blockProps} {...styles}>
      {content}
    </Text>
  );
};

registerChaiBlock(TextBlock, {
  type: "Text",
  label: "Text",
  group: "basic",
  category: "core",
  icon: TextIcon,
  props: {
    content: SingleLineText({ title: "Content", default: "Enter your text here..." }),
    styles: Styles({ default: "text-xl" }),
  },
});

export default TextBlock;

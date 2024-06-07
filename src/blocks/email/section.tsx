import { Section } from "@react-email/components";
import { registerChaiBlock } from "@chaibuilder/runtime";
import { Styles } from "@chaibuilder/runtime/controls";
import { ImageIcon } from "@radix-ui/react-icons";

const SectionBlock = ({ blockProps, styles, children }: any) => {
  return (
    <Section {...blockProps} {...styles}>
      {children}
    </Section>
  );
};

registerChaiBlock(SectionBlock, {
  type: "Section",
  label: "Section",
  group: "basic",
  category: "core",
  icon: ImageIcon,
  props: {
    styles: Styles({ default: "w-full" }),
  },
  canAcceptBlock: () => true,
});

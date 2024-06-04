import { Container } from "@react-email/components";
import { registerChaiBlock } from "@chaibuilder/runtime";
import { Styles } from "@chaibuilder/runtime/controls";

const ContainerBlock = ({ blockProps, styles, children }) => {
  return (
    <Container {...blockProps} {...styles}>
      {children}
    </Container>
  );
};

registerChaiBlock(ContainerBlock, {
  type: "Container",
  label: "Container",
  group: "basic",
  category: "core",
  hidden: true,
  props: { styles: Styles({ default: "" }) },
  canAcceptBlock: () => true,
  canMove: () => false,
  canDelete: () => false,
  canDuplicate: () => false,
});

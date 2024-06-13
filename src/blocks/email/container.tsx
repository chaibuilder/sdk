import { Container } from "@react-email/components";
import { registerChaiBlock } from "@chaibuilder/runtime";
import EmptySlot from "../empty-slot.tsx";

const ContainerBlock = ({ blockProps, styles, children }) => {
  if (!children) {
    return <EmptySlot blockProps={blockProps} styles={styles} />;
  }
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
  canAcceptBlock: () => true,
  canMove: () => true,
  canDelete: () => false,
  canDuplicate: () => false,
  canBeNested: (parentType?: string) => !parentType,
});

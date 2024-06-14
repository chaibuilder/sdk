import { Container } from "@react-email/components";
import { registerChaiBlock } from "@chaibuilder/runtime";
import EmptySlot from "../empty-slot.tsx";

const ContainerBlock = ({ blockProps, styles, children, inBuilder }) => {
  let nestedChildren = children;
  if (!children) {
    nestedChildren = <EmptySlot blockProps={{}} styles={{}} inBuilder={inBuilder} />;
  }
  return (
    <Container {...blockProps} {...styles}>
      {nestedChildren}
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

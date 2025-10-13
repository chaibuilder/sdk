import { Component as CollectionListComponent, Config as CollectionListConfig } from "@/_demo/blocks/collection-list";
import { Component as ModalComponent, Config as ModalConfig } from "@/_demo/blocks/modal";
import { ChaiBlockComponentProps, registerChaiBlock } from "@chaibuilder/runtime";

const PaginationComponent = (props: ChaiBlockComponentProps<any>) => {
  console.log(props);
  return <div>Pagination New </div>;
};

const PaginationConfig = {
  type: "Pagination",
  label: "Pagination",
  icon: "",
  group: "basic",
  hidden: true,
  canAcceptBlock: () => true,
  canDelete: () => false,
  canMove: () => false,
  canDuplicate: () => false,
};

export default function registerCustomBlocks() {
  registerChaiBlock(CollectionListComponent, CollectionListConfig);
  registerChaiBlock(ModalComponent, ModalConfig);
  registerChaiBlock(PaginationComponent, PaginationConfig);
}

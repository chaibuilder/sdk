import { Component as CollectionListComponent, Config as CollectionListConfig } from "@/_demo/blocks/collection-list";
import { Component as ModalComponent, Config as ModalConfig } from "@/_demo/blocks/modal";
import { registerChaiBlock } from "@chaibuilder/runtime";

const PaginationComponent = () => {
  return <div>Pagination</div>;
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

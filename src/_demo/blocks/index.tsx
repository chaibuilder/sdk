import { Component as CollectionListComponent, Config as CollectionListConfig } from "@/_demo/blocks/collection-list";
import { Component as ModalComponent, Config as ModalConfig } from "@/_demo/blocks/modal";
import { registerChaiBlock } from "@chaibuilder/runtime";

export default function registerCustomBlocks() {
  registerChaiBlock(CollectionListComponent, CollectionListConfig);
  registerChaiBlock(ModalComponent, ModalConfig);
}

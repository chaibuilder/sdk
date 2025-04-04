import { registerChaiBlock } from "@chaibuilder/runtime";
import { Component as CollectionListComponent, Config as CollectionListConfig } from "./CollectionList";
import { Component as ModalComponent, Config as ModalConfig } from "./modal";

export default function registerCustomBlocks() {
  registerChaiBlock(CollectionListComponent, CollectionListConfig);
  registerChaiBlock(ModalComponent, ModalConfig);
}

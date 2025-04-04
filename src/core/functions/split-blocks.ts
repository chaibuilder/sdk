import { ChaiBlock } from "../../types/chai-block.ts";
import { convertToBlocksTree } from "./Blocks.ts";

export function getBlocksTree(blocks: Partial<ChaiBlock>[]) {
  return convertToBlocksTree(blocks);
}

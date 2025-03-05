import { ChaiBlock } from "../types/ChaiBlock.ts";
import { convertToBlocksTree } from "./Blocks.ts";

export function getBlocksTree(blocks: Partial<ChaiBlock>[]) {
  return convertToBlocksTree(blocks);
}

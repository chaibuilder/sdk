import { convertToBlocksTree } from "@/core/functions/Blocks";
import { ChaiBlock } from "@/types/chai-block";

export function getBlocksTree(blocks: Partial<ChaiBlock>[]) {
  return convertToBlocksTree(blocks);
}

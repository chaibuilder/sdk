import { convertToBlocksTree } from "@/core/functions/blocks-fn";
import { ChaiBlock } from "@/types/chai-block";

export function getBlocksTree(blocks: Partial<ChaiBlock>[]) {
  return convertToBlocksTree(blocks);
}

import { ChaiBuilderBlockWithAtom } from "../atoms/blocks";

export function insertBlocksAtPosition(
  allBlocks: ChaiBuilderBlockWithAtom[],
  newBlocks: ChaiBuilderBlockWithAtom[],
  parentId?: string,
  position?: number,
) {
  // If no parentId is provided, append new blocks to the end of top-level blocks
  let parentBlocks = allBlocks.filter((block) => !block._parent);

  if (parentId) {
    // Filter the blocks that belong to the specified parent
    parentBlocks = allBlocks.filter((block) => block._parent === parentId);
  }

  // Determine the position to insert the new blocks
  const insertPosition =
    !isNaN(position) || position > -1 ? Math.min(position, parentBlocks.length) : parentBlocks.length;

  // Find the correct index in the allBlocks array to insert the new blocks
  let insertIndex = allBlocks.length;
  for (let i = 0, count = 0; i < allBlocks.length; i++) {
    if (allBlocks[i]._parent === parentId) {
      if (count === insertPosition) {
        insertIndex = i;
        break;
      }
      count++;
    }
  }

  // If no parentId is specified and position is greater than top-level blocks count
  if (!parentId && position !== undefined && position >= parentBlocks.length) {
    insertIndex = allBlocks.length;
  }

  // Insert the new blocks at the specified position within the parent block
  return [...allBlocks.slice(0, insertIndex), ...newBlocks, ...allBlocks.slice(insertIndex)];
}

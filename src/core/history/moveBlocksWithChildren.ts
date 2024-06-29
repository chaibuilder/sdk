import { ChaiBlock } from "../types/ChaiBlock.ts";
import { isEmpty } from "lodash";

function sortBlocks(blocks: Partial<ChaiBlock>[]) {
  const sortedBlocks = [];
  const blockMap = new Map();

  // Create a map of all blocks
  blocks.forEach((block) => {
    blockMap.set(block._id, block);
  });

  // Helper function to add a block and its children to the sortedBlocks array
  function addBlockAndChildren(blockId) {
    const block = blockMap.get(blockId);
    if (!sortedBlocks.includes(block)) {
      sortedBlocks.push(block);
      blocks.forEach((b) => {
        if (b._parent === blockId) {
          addBlockAndChildren(b._id);
        }
      });
    }
  }

  // Start adding blocks from the top-level parents
  blocks.forEach((block) => {
    if (block._parent === undefined) {
      addBlockAndChildren(block._id);
    }
  });

  return sortedBlocks;
}

export const moveBlocksWithChildren = (
  _blocks: Partial<ChaiBlock>[],
  idsToMove: string[],
  newParent: string | undefined,
  position: number,
): Partial<ChaiBlock>[] => {
  if (isEmpty(idsToMove)) return sortBlocks(_blocks);

  // Helper function to find all children of a block recursively
  function findAllChildren(blocks: Partial<ChaiBlock>[], parentId: string): Partial<ChaiBlock>[] {
    const children = blocks.filter((block) => block._parent === parentId);
    let allChildren = [...children];
    children.forEach((child) => {
      allChildren = allChildren.concat(findAllChildren(blocks, child._id!));
    });
    return allChildren;
  }

  // Find all blocks to move including their children
  const blocksToMove = idsToMove.reduce((acc: Partial<ChaiBlock>[], id: string) => {
    const block = _blocks.find((b) => b._id === id);
    if (block) {
      // Add the block and its children to the blocksToMove array
      const children = findAllChildren(_blocks, id);
      acc.push(block, ...children);
    }
    return acc;
  }, []);

  // Remove blocks to move from the original array
  _blocks = _blocks.filter((block) => !blocksToMove.includes(block));

  // Update the _parent property of the blocks to move
  blocksToMove.forEach((block) => {
    if (idsToMove.includes(block._id!)) {
      block._parent = newParent;
    }
  });

  // Find the correct insertion index based on newParent and position
  let insertIndex;
  if (newParent === undefined) {
    insertIndex = position;
  } else {
    // Find the index of the newParent block
    const parentIndex = _blocks.findIndex((block) => block._id === newParent);
    if (parentIndex === -1) {
      // If newParent is not found, insert at the specified position
      insertIndex = position;
    } else {
      // Calculate the insertion index
      insertIndex = parentIndex + 1;
      let currentPos = 0;
      while (currentPos < position && insertIndex < _blocks.length) {
        if (_blocks[insertIndex]._parent === newParent) {
          currentPos++;
        }
        insertIndex++;
      }
    }
  }

  // Insert the blocks to move at the calculated position
  _blocks.splice(insertIndex, 0, ...blocksToMove);

  return sortBlocks(_blocks);
};

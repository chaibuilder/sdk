import { ChaiBlock } from "../types/ChaiBlock.ts";

export const moveBlocksWithChildren = (
  _blocks: Partial<ChaiBlock>[],
  idsToMove: string[],
  newParent: string | undefined,
  position: number,
) => {
  // Helper function to find all children of a block recursively
  function findAllChildren(blocks, parentId) {
    const children = blocks.filter((block) => block._parent === parentId);
    let allChildren = [...children];
    children.forEach((child) => {
      allChildren = allChildren.concat(findAllChildren(blocks, child._id));
    });
    return allChildren;
  }

  // Find all blocks to move including their children
  const blocksToMove = idsToMove.reduce((acc, id) => {
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
    if (idsToMove.includes(block._id)) {
      block._parent = newParent;
    }
  });

  // Find the correct insertion index based on newParent and position
  let insertIndex;
  if (newParent === undefined) {
    // If newParent is undefined, we insert at the top level at the given position
    insertIndex = position;
  } else {
    // Find the index of the newParent block
    const parentIndex = _blocks.findIndex((block) => block._id === newParent);
    // Insert after the newParent block and the given position
    insertIndex = parentIndex + 1 + position;
  }

  // Insert the blocks to move at the calculated position
  _blocks.splice(insertIndex, 0, ...blocksToMove);

  return _blocks;
};

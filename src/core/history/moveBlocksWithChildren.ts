import { ChaiBlock } from "../types/ChaiBlock.ts";
import { getDuplicatedBlocks } from "../functions/Blocks.ts";
import { each, filter, range } from "lodash";

function sortBlocks(blocks: Partial<ChaiBlock>[]) {
  const sortedBlocks = [];
  const blockMap = new Map<string, Partial<ChaiBlock>>();

  // Create a map of all blocks
  blocks.forEach((block) => {
    blockMap.set(block._id!, block);
  });

  // Helper function to add a block and its children to the sortedBlocks array
  function addBlockAndChildren(blockId: string | undefined) {
    const block = blockMap.get(blockId!);
    if (block && !sortedBlocks.includes(block)) {
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
    if (!block._parent) {
      addBlockAndChildren(block._id);
    }
  });

  return sortedBlocks;
}

function findDescendants(tree: Partial<ChaiBlock>[], nodeId: string): Partial<ChaiBlock>[] {
  const descendants: Partial<ChaiBlock>[] = [];
  const stack = [nodeId];

  while (stack.length > 0) {
    const currentId = stack.pop()!;
    const children = tree.filter((node) => node._parent === currentId);
    descendants.push(...children);
    stack.push(...children.map((child) => child._id!));
  }

  return descendants;
}

const getAbsoluteDropIndexForPosition = (
  blocks: Partial<ChaiBlock>[],
  newParentId: string | undefined | null,
  newPosition: number,
) => {
  let newPositionIndex = newParentId ? blocks.findIndex((block) => block._id === newParentId) : 0;
  const children = filter(blocks, (block) => (newParentId ? block._parent === newParentId : !block._parent));
  each(range(newPosition), (index) => {
    const childBlocks = [children[index], ...findDescendants(blocks, children[index]._id!)];
    newPositionIndex += childBlocks.length;
  });
  return newPositionIndex;
};

function moveBlocksWithChildren(
  _blocks: Partial<ChaiBlock>[],
  idToMove: string,
  newParentId: string | undefined | null,
  newPosition: number,
): Partial<ChaiBlock>[] {
  let newBlocks = _blocks;
  const blockToMove = _blocks.find((block) => block._id === idToMove);
  const blocksToRemove = [blockToMove, ...findDescendants(_blocks, idToMove)];
  const duplicatedBlocks = getDuplicatedBlocks(_blocks, idToMove, newParentId);
  const absoluteDropIndex = getAbsoluteDropIndexForPosition(_blocks, newParentId, newPosition);
  _blocks.splice(absoluteDropIndex, 0, ...duplicatedBlocks);
  newBlocks = _blocks;
  newBlocks = newBlocks.filter((block) => !blocksToRemove.includes(block));
  return sortBlocks(newBlocks);
}

export { moveBlocksWithChildren };

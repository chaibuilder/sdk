import { ChaiBlock } from "../types/ChaiBlock.ts";
import { getDuplicatedBlocks } from "../functions/Blocks.ts";
import { filter } from "lodash";

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
  let parentPosition = 0;
  for (let i = 0; i < blocks.length; i++) {
    if (!newParentId) break;
    if (newParentId && blocks[i]._parent === newParentId) {
      parentPosition = i;
      break;
    }
  }
  let newPositionIndex = parentPosition;
  const children = filter(blocks, (block) => (newParentId ? block._parent === newParentId : !block._parent));
  for (let i = 0; i < newPosition; i++) {
    const childBlocks = [children[i], ...findDescendants(blocks, children[i]._id!)];
    newPositionIndex += childBlocks.length;
  }
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
  blockToMove._parent = newParentId;
  const blocksToRemove = [blockToMove, ...findDescendants(_blocks, idToMove)];
  const duplicatedBlocks = getDuplicatedBlocks(_blocks, idToMove, newParentId);
  const absoluteDropIndex = getAbsoluteDropIndexForPosition(_blocks, newParentId, newPosition);
  _blocks.splice(absoluteDropIndex, 0, ...duplicatedBlocks);
  newBlocks = _blocks;
  newBlocks = newBlocks.filter((block) => !blocksToRemove.includes(block));

  //TODO: Handle the content of new parent and old parent
  return sortBlocks(newBlocks);
}

export { moveBlocksWithChildren };

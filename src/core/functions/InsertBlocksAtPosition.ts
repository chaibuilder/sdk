import { filter, findIndex, isEmpty, last } from "lodash-es";
import { ChaiBlock } from "../types/ChaiBlock";

export function insertBlocksAtPosition(
  allBlocks: ChaiBlock[],
  newBlocks: ChaiBlock[],
  allowChildren: boolean = false,
  parentId?: string,
  position?: number,
) {
  // otherwise, find the index of the parent and add the destination index to it
  if (position !== null) {
    // @ts-ignore
    const parentIndex = findIndex(allBlocks, { _parent: parentId });
    const insertIndex = (parentIndex === -1 ? 0 : parentIndex) + position;
    // add the new blocks array to the original array at the correct index
    allBlocks.splice(insertIndex, 0, ...newBlocks);
    return allBlocks;
  }

  if (!allowChildren) {
    const index = findIndex(allBlocks, { _id: parentId });
    // if the destination index is null, just add the new blocks next to current selection
    const insertIndex = index + 1;
    // add the new blocks array to the original array at the correct index
    allBlocks.splice(insertIndex, 0, ...newBlocks);
    return allBlocks;
  }

  let lastIndex = findIndex(allBlocks, { _id: parentId });
  const childBlocks = filter(allBlocks, { _parent: parentId });
  if (!isEmpty(childBlocks)) {
    lastIndex = findIndex(allBlocks, { _id: last(childBlocks)!._id });
  }
  const insertIndex = lastIndex + 1;
  allBlocks.splice(insertIndex, 0, ...newBlocks);
  return allBlocks;
}

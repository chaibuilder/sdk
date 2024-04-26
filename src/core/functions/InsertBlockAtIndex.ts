import { filter, findIndex, isEmpty, last } from "lodash";
import { ChaiBlock } from "../types/ChaiBlock";

export function insertBlockAtIndex(
  allBlocks: ChaiBlock[],
  parentId: string | null,
  destinationIndex: number | null,
  newBlocks: ChaiBlock[],
  allowChildren: boolean,
) {
  // otherwise, find the index of the parent and add the destination index to it
  if (destinationIndex !== null) {
    // @ts-ignore
    const parentIndex = findIndex(allBlocks, { _parent: parentId });
    const insertIndex = (parentIndex === -1 ? 0 : parentIndex) + destinationIndex;
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

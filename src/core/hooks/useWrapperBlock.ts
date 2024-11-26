import { useAtomValue } from "jotai";
import { getRegisteredChaiBlock } from "@chaibuilder/runtime";
import { ChaiBlock } from "@chaibuilder/runtime";
import { atom } from "jotai";
import { presentBlocksAtom } from "../atoms/blocks";
import { find } from "lodash-es";
import { selectedBlockIdsAtom } from "./useSelectedBlockIds";

// * This atom computes the wrapper block for the currently selected block.
// * It iterates through the block's ancestors to find the first block that is marked as a wrapper.
const wrapperBlockAtom = atom<ChaiBlock>((get) => {
  const blocks = get(presentBlocksAtom);
  const blockIds = get(selectedBlockIdsAtom);

  // If only one block is selected, use its ID; otherwise, return null
  const blockId = blockIds.length === 1 ? blockIds[0] : null;
  if (!blockId) return null;

  // Find the block with the selected ID
  const block = find(blocks, { _id: blockId });
  if (!block) return null; // If the block is not found, return null

  // Start from the selected block and move up the parent chain
  let parentId = block._parent;
  while (parentId) {
    const parentBlock = find(blocks, { _id: parentId });
    if (!parentBlock) return null; // If the parent block is not found, return null

    // Check if the parent block is a wrapper block
    if (getRegisteredChaiBlock(parentBlock._type)?.wrapper) {
      return parentBlock; // If it's a wrapper, return it
    }

    parentId = parentBlock._parent;
  }

  // If no wrapper block is found, return null
  return null;
});
wrapperBlockAtom.debugLabel = "wrapperBlockAtom";

export const useWrapperBlock = () => useAtomValue<ChaiBlock>(wrapperBlockAtom);

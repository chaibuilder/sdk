import { filter, find, includes, isEmpty } from "lodash-es";
import { useCallback } from "react";
import { ChaiBuilderBlockWithAtom } from "../atoms/blocks.ts";
import { useBlocksStore, useBlocksStoreUndoableActions } from "../history/useBlocksStoreUndoableActions.ts";
import { useSelectedBlockIds } from "./useSelectedBlockIds";

export const removeNestedBlocks = (
  blocks: ChaiBuilderBlockWithAtom[],
  blockIds: Array<string>,
): ChaiBuilderBlockWithAtom[] => {
  const _blockIds: Array<string> = [];
  const _blocks = filter(blocks, (block: ChaiBuilderBlockWithAtom) => {
    if (includes(blockIds, block._id) || includes(blockIds, block._parent)) {
      _blockIds.push(block._id);
      return false;
    }
    return true;
  });

  if (!isEmpty(_blockIds)) return removeNestedBlocks(_blocks, _blockIds);
  return _blocks;
};

export const useRemoveBlocks = () => {
  const [presentBlocks] = useBlocksStore();
  const [ids, setSelectedIds] = useSelectedBlockIds();
  const { setNewBlocks } = useBlocksStoreUndoableActions();

  return useCallback(
    (blockIds: Array<string>) => {
      const parentBlockId = find(presentBlocks, { _id: blockIds[0] })?._parent || null;
      setNewBlocks(removeNestedBlocks(presentBlocks, blockIds));
      setTimeout(() => setSelectedIds(parentBlockId ? [parentBlockId] : []), 200);
    },
    [presentBlocks, setSelectedIds, ids],
  );
};

import { useAtomValue } from "jotai";
import { useCallback } from "react";
import { isEmpty, find, first } from "lodash-es";
import { useDuplicateBlocks } from "./useDuplicateBlocks";
import { copiedBlockIdsAtom } from "./useCopyBlockIds";
import { useCutBlockIds } from "./useCutBlockIds";
import { presentBlocksAtom } from "../atoms/blocks";
import { canAcceptChildBlock } from "../functions/block-helpers.ts";
import { useBlocksStore, useBlocksStoreUndoableActions } from "../history/useBlocksStoreUndoableActions.ts";

const useCanPaste = () => {
  const [blocks] = useBlocksStore();
  return (ids: string[], newParentId: string | null) => {
    const newParentType = find(blocks, { _id: newParentId })?._type || null;
    const blockType = first(ids.map((id) => find(blocks, { _id: id })?._type));
    return canAcceptChildBlock(newParentType, blockType);
  };
};

const useMoveCutBlocks = () => {
  const presentBlocks = useAtomValue(presentBlocksAtom);
  const { moveBlocks } = useBlocksStoreUndoableActions();

  return useCallback(
    (blockIds: Array<string>, newParentId: string[] | string) => {
      const parentId = Array.isArray(newParentId) ? newParentId[0] : newParentId;

      if (newParentId === "root") {
        const newParentBlock = presentBlocks.filter((block) => !block._parent);
        moveBlocks(blockIds, null, newParentBlock?.length || 0);
      } else {
        const newParentBlock = presentBlocks.find((block) => block._id === newParentId);
        const newPosition = newParentBlock ? newParentBlock?.children?.length : 0;
        moveBlocks(blockIds, parentId, newPosition);
      }
    },
    [moveBlocks, presentBlocks],
  );
};

export const usePasteBlocks = (): {
  canPaste: (newParentId: string) => boolean;
  pasteBlocks: Function;
} => {
  // @ts-ignore
  const copiedBlockIds: Array<string> = useAtomValue(copiedBlockIdsAtom);
  const [cutBlockIds, setCutBlockIds] = useCutBlockIds();
  const duplicateBlocks = useDuplicateBlocks();
  const moveCutBlocks = useMoveCutBlocks();
  const canPasteBlocks = useCanPaste();
  const canPaste = useCallback(
    (newParentId: string) => {
      if (copiedBlockIds.length > 0) {
        return canPasteBlocks(copiedBlockIds, newParentId);
      } else if (cutBlockIds.length > 0) {
        return canPasteBlocks(cutBlockIds, newParentId);
      } else {
        return false;
      }
    },
    [canPasteBlocks, copiedBlockIds, cutBlockIds],
  );

  return {
    canPaste,
    pasteBlocks: useCallback(
      (newParentId: string | string[]) => {
        const parentId = Array.isArray(newParentId) ? newParentId[0] : newParentId;

        if (!isEmpty(copiedBlockIds)) {
          duplicateBlocks(copiedBlockIds, parentId);
        } else {
          moveCutBlocks(cutBlockIds, newParentId);
        }
        setCutBlockIds([]);
      },
      [cutBlockIds, copiedBlockIds, duplicateBlocks, moveCutBlocks, setCutBlockIds],
    ),
  };
};

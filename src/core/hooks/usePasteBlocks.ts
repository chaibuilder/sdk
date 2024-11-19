import { useAtomValue } from "jotai";
import { useCallback } from "react";
import { isEmpty, find, first } from "lodash-es";
import { useDuplicateBlocks } from "./useDuplicateBlocks";

import { useCutBlockIds } from "./useCutBlockIds";
import { presentBlocksAtom } from "../atoms/blocks";
import { canAcceptChildBlock } from "../functions/block-helpers.ts";
import { useBlocksStore, useBlocksStoreUndoableActions } from "../history/useBlocksStoreUndoableActions.ts";

const useCanPaste = () => {
  const [blocks] = useBlocksStore();
  return (ids: string[], newParentId: string | null) => {
    const newParentType = find(blocks, { _id: newParentId })?._type;
    const blockType = first(ids.map((id) => find(blocks, { _id: id })?._type));
    return canAcceptChildBlock(newParentType, blockType);
  };
};

const useMoveCutBlocks = () => {
  const presentBlocks = useAtomValue(presentBlocksAtom);
  const { moveBlocks } = useBlocksStoreUndoableActions();

  return useCallback(
    (blockIds: Array<string>, newParentId: string[] | string) => {
      const parentId = newParentId[0];
      const newParentBlock = presentBlocks.find((block) => block._id === newParentId);
      const newPosition = newParentBlock ? newParentBlock.children.length : 0;

      moveBlocks(blockIds, parentId, newPosition);
    },
    [moveBlocks, presentBlocks],
  );
};

export const usePasteBlocks = (): {
  canPaste: (newParentId: string) => boolean;
  pasteBlocks: (newParentId: string | string[]) => void;
} => {
  const [cutBlockIds, setCutBlockIds] = useCutBlockIds();
  const duplicateBlocks = useDuplicateBlocks();
  const moveCutBlocks = useMoveCutBlocks();
  const canPasteBlocks = useCanPaste();

  const canPaste = useCallback(
    (newParentId: string) => {
      if (cutBlockIds.length > 0) {
        return canPasteBlocks(cutBlockIds, newParentId);
      }

      const copiedBlocksStr = sessionStorage.getItem("_chai_copied_blocks");
      if (copiedBlocksStr) {
        const copiedBlocks = JSON.parse(copiedBlocksStr);

        return canPasteBlocks(
          copiedBlocks.map((block: any) => block.id),
          newParentId,
        );
      }

      return false;
    },
    [canPasteBlocks, cutBlockIds],
  );

  return {
    canPaste,
    pasteBlocks: useCallback(
      (newParentId: string | string[]) => {
        const parentId = Array.isArray(newParentId) ? newParentId[0] : newParentId;

        if (!isEmpty(cutBlockIds)) {
          moveCutBlocks(cutBlockIds, newParentId);
          setCutBlockIds([]);
          return;
        }

        const copiedBlocksStr = sessionStorage.getItem("_chai_copied_blocks");
        if (copiedBlocksStr) {
          const copiedBlocks = JSON.parse(copiedBlocksStr);
          duplicateBlocks(
            copiedBlocks.map((block: any) => block.id),
            parentId,
          );
          sessionStorage.removeItem("_chai_copied_blocks");
          return;
        }
      },
      [cutBlockIds, duplicateBlocks, moveCutBlocks, setCutBlockIds],
    ),
  };
};

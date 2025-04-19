import { presentBlocksAtom } from "@/core/atoms/blocks";
import { canAcceptChildBlock } from "@/core/functions/block-helpers";
import { useBlocksStore, useBlocksStoreUndoableActions } from "@/core/history/use-blocks-store-undoable-actions";
import { useCopyBlockIds } from "@/core/hooks/use-copy-blockIds";
import { useCutBlockIds } from "@/core/hooks/use-cut-blockIds";
import { useDuplicateBlocks } from "@/core/hooks/use-duplicate-blocks";
import { useAtomValue } from "jotai";
import { find, first, isEmpty } from "lodash-es";
import { useCallback } from "react";

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
        const newParentBlock = presentBlocks?.filter((block) => !block._parent);
        moveBlocks(blockIds, null, newParentBlock?.length || 0);
      } else {
        const newParentBlock = presentBlocks?.filter((block) => block._parent === parentId);
        moveBlocks(blockIds, parentId, newParentBlock?.length || 0);
      }
    },
    [moveBlocks, presentBlocks],
  );
};

export const usePasteBlocks = (): {
  canPaste: (newParentId: string) => Promise<boolean>;
  pasteBlocks: (newParentId: string | string[]) => Promise<void>;
} => {
  const [cutBlockIds, setCutBlockIds] = useCutBlockIds();
  const [copiedBlockIds] = useCopyBlockIds();
  const moveCutBlocks = useMoveCutBlocks();
  const duplicateBlocks = useDuplicateBlocks();
  const canPasteBlocks = useCanPaste();
  const canPaste = useCallback(
    async (newParentId: string) => {
      if (cutBlockIds.length > 0) {
        return canPasteBlocks(cutBlockIds, newParentId);
      }
      return false;
    },
    [canPasteBlocks, cutBlockIds],
  );

  return {
    canPaste,
    pasteBlocks: useCallback(
      async (newParentId: string | string[]) => {
        const parentId = Array.isArray(newParentId) ? newParentId[0] : newParentId;

        if (!isEmpty(cutBlockIds)) {
          moveCutBlocks(cutBlockIds, newParentId);
          setCutBlockIds([]);
          return;
        }

        if (!isEmpty(copiedBlockIds)) {
          duplicateBlocks(copiedBlockIds, parentId);
          return;
        }
      },
      [cutBlockIds, moveCutBlocks, setCutBlockIds],
    ),
  };
};

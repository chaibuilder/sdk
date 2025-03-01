import { useAtomValue } from "jotai";
import { find, first, has, isEmpty } from "lodash-es";
import { useCallback } from "react";
import { toast } from "sonner";
import { presentBlocksAtom } from "../atoms/blocks";
import { canAcceptChildBlock } from "../functions/block-helpers.ts";
import { useBlocksStore, useBlocksStoreUndoableActions } from "../history/useBlocksStoreUndoableActions.ts";
import { useAddBlock } from "./useAddBlock";
import { useCutBlockIds } from "./useCutBlockIds";

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
  const moveCutBlocks = useMoveCutBlocks();
  const canPasteBlocks = useCanPaste();
  const { addPredefinedBlock } = useAddBlock();

  /* Can Paste is true if the clipboard contains copied blocks key
   * while using keyboard shortcuts (ctrl+c, command+c)
   */
  const canPaste = useCallback(
    async (newParentId: string) => {
      if (cutBlockIds.length > 0) {
        return canPasteBlocks(cutBlockIds, newParentId);
      }

      try {
        const clipboardContent = await navigator.clipboard.readText();
        if (clipboardContent) {
          const clipboardData = JSON.parse(clipboardContent);
          return has(clipboardData, "_chai_copied_blocks");
        }
      } catch (error) {
        return false;
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
          await navigator.clipboard.writeText("");
          return;
        }

        try {
          const clipboardContent = await navigator.clipboard.readText();
          if (clipboardContent) {
            const clipboardData = JSON.parse(clipboardContent);
            if (has(clipboardData, "_chai_copied_blocks")) {
              addPredefinedBlock(clipboardData._chai_copied_blocks, parentId === "root" ? null : parentId);
            } else {
              toast.error("Nothing to paste");
            }
          } else {
            toast.error("Nothing to paste");
          }
        } catch (error) {
          toast.error("Failed to paste blocks from clipboard");
        }
      },
      [cutBlockIds, addPredefinedBlock, moveCutBlocks, setCutBlockIds],
    ),
  };
};

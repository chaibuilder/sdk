import { useAtomValue } from "jotai";
import { useCallback } from "react";
import { isEmpty, find, first } from "lodash-es";
import { useCutBlockIds } from "./useCutBlockIds";
import { presentBlocksAtom } from "../atoms/blocks";
import { canAcceptChildBlock } from "../functions/block-helpers.ts";
import { useBlocksStore, useBlocksStoreUndoableActions } from "../history/useBlocksStoreUndoableActions.ts";
import { useToast } from "../../ui";
import { useAddBlock } from "./useAddBlock";

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
      const parentId = Array.isArray(newParentId) ? newParentId[0] : newParentId;
      const newParentBlock = presentBlocks.find((block) => block._id === parentId);
      const newPosition = newParentBlock ? newParentBlock.children?.length || 0 : 0;

      moveBlocks(blockIds, parentId, newPosition);
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
  const { toast } = useToast();
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
          return Array.isArray(clipboardData) && 
                 clipboardData.some(item => item._chai_copied_blocks);
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
            if (Array.isArray(clipboardData) && 
                clipboardData.some(item => item._chai_copied_blocks)) {
              clipboardData.forEach((item) => {
                addPredefinedBlock(item._chai_copied_blocks, parentId);
              });
            } else {
              toast({ title: "Error", description: "Nothing to paste" });
            }
          } else {
            toast({ title: "Error", description: "Nothing to paste" });
          }
        } catch (error) {
          toast({ title: "Error", description: "Failed to paste blocks from clipboard" });
        }
      },
      [cutBlockIds, addPredefinedBlock, moveCutBlocks, setCutBlockIds, toast],
    ),
  };
};

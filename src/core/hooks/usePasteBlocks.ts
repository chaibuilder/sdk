import { useAtomValue } from "jotai";
import { useCallback } from "react";
import { isEmpty, find, first } from "lodash-es";
import { useDuplicateBlocks } from "./useDuplicateBlocks";

import { useCutBlockIds } from "./useCutBlockIds";
import { presentBlocksAtom } from "../atoms/blocks";
import { canAcceptChildBlock } from "../functions/block-helpers.ts";
import { useBlocksStore, useBlocksStoreUndoableActions } from "../history/useBlocksStoreUndoableActions.ts";
import { useToast } from "../../ui";

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
  canPaste: (newParentId: string) => Promise<boolean>;
  pasteBlocks: (newParentId: string | string[]) => Promise<void>;
} => {
  const [cutBlockIds, setCutBlockIds] = useCutBlockIds();
  const duplicateBlocks = useDuplicateBlocks();
  const moveCutBlocks = useMoveCutBlocks();
  const canPasteBlocks = useCanPaste();
  const { toast } = useToast();

  const canPaste = useCallback(
    async (newParentId: string) => {
      if (cutBlockIds.length > 0) {
        return canPasteBlocks(cutBlockIds, newParentId);
      }

      const clipboardContent = await navigator.clipboard.readText();
      if (clipboardContent) {
        try {
          const copiedBlocks = JSON.parse(clipboardContent);
          return canPasteBlocks(
            copiedBlocks.map((block: any) => block.id),
            newParentId,
          );
        } catch {
          return false;
        }
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
          // Clear clipboard when cutting blocks
          await navigator.clipboard.writeText("");
          return;
        }

        const clipboardContent = await navigator.clipboard.readText();
        if (clipboardContent) {
          try {
            const copiedBlocks = JSON.parse(clipboardContent);
            duplicateBlocks(
              copiedBlocks.map((block: any) => block.id),
              parentId,
            );
            await navigator.clipboard.writeText("");
          } catch {
            toast({ title: "Error", description: "Failed to paste blocks from clipboard" });
          }
        }
      },
      [cutBlockIds, duplicateBlocks, moveCutBlocks, setCutBlockIds, toast],
    ),
  };
};

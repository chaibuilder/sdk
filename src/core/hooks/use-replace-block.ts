import { useBlocksStore, useBlocksStoreUndoableActions } from "@/core/history/use-blocks-store-undoable-actions";
import { useSelectedBlockIds } from "@/core/hooks/use-selected-blockIds";
import { PERMISSIONS, usePermissions } from "@/core/main";
import { ChaiBlock } from "@/types/chai-block";
import { filter, find } from "lodash-es";
import { useCallback } from "react";

export const replaceBlock = (blocks: ChaiBlock[], blockId: string, replacementBlocks: ChaiBlock[]): ChaiBlock[] => {
  // Find the block to be replaced
  const blockToReplace = find(blocks, { _id: blockId });
  if (!blockToReplace) return blocks;

  const parentId = blockToReplace._parent;

  // Update replacement blocks to have the same parent as the block being replaced
  const updatedReplacementBlocks = replacementBlocks.map((block) => ({
    ...block,
    _parent: parentId,
  }));

  // Remove the original block and its children, then add replacement blocks
  const blocksWithoutTarget = filter(blocks, (block: ChaiBlock) => {
    return block._id !== blockId && block._parent !== blockId;
  });

  return [...blocksWithoutTarget, ...updatedReplacementBlocks];
};

export const useReplaceBlock = () => {
  const [presentBlocks] = useBlocksStore();
  const [, setSelectedIds] = useSelectedBlockIds();
  const { setNewBlocks } = useBlocksStoreUndoableActions();
  const { hasPermission } = usePermissions();

  return useCallback(
    (blockId: string, replacementBlocks: ChaiBlock[]) => {
      if (!hasPermission(PERMISSIONS.EDIT_BLOCK)) return;
      const newBlocks = replaceBlock(presentBlocks, blockId, replacementBlocks);
      setNewBlocks(newBlocks);
      // Select the first replacement block after replace
      if (replacementBlocks.length > 0) {
        setTimeout(() => setSelectedIds([replacementBlocks[0]._id]), 200);
      }
    },
    [presentBlocks, setSelectedIds, setNewBlocks, hasPermission],
  );
};

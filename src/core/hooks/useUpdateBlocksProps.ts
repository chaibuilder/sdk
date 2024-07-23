import { useCallback } from "react";
import { useBlocksStoreUndoableActions } from "../history/useBlocksStoreUndoableActions.ts";
import { ChaiBlock } from "../types/ChaiBlock.ts";

/**
 *
 */
export const useUpdateBlocksProps = () => {
  const { updateBlocks } = useBlocksStoreUndoableActions();
  return useCallback(
    (blockIds: Array<string>, props: Record<string, any>, prevPropsState?: Record<string, any>) => {
      updateBlocks(blockIds, props, prevPropsState);
    },
    [updateBlocks],
  );
};

export const useUpdateMultipleBlocksProps = () => {
  const { updateMultipleBlocksProps } = useBlocksStoreUndoableActions();
  return useCallback(
    (blocks: Array<{ _id: string } & Partial<ChaiBlock>>) => {
      updateMultipleBlocksProps(blocks);
    },
    [updateMultipleBlocksProps],
  );
};

export const useUpdateBlocksPropsRealtime = () => {
  const { updateBlocksRuntime } = useBlocksStoreUndoableActions();
  return useCallback(
    (blockIds: Array<string>, props: Record<string, any>) => {
      updateBlocksRuntime(blockIds, props);
    },
    [updateBlocksRuntime],
  );
};

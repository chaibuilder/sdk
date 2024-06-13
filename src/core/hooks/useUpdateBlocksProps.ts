import { useCallback } from "react";
import { useBlocksStoreUndoableActions } from "../history/useBlocksStoreUndoableActions.ts";

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

export const useUpdateBlocksPropsRealtime = () => {
  const { updateBlocksRuntime } = useBlocksStoreUndoableActions();
  return useCallback(
    (blockIds: Array<string>, props: Record<string, any>) => {
      updateBlocksRuntime(blockIds, props);
    },
    [updateBlocksRuntime],
  );
};

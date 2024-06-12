import { useCallback } from "react";
import { useBlocksStoreActions } from "../history/useBlocksStoreActions.ts";

/**
 *
 */
export const useUpdateBlocksProps = () => {
  const { updateBlocks } = useBlocksStoreActions();
  return useCallback(
    (blockIds: Array<string>, props: Record<string, any>, prevPropsState?: Record<string, any>) => {
      updateBlocks(blockIds, props, prevPropsState);
    },
    [updateBlocks],
  );
};

export const useUpdateBlocksPropsRealtime = () => {
  const { updateBlocksRuntime } = useBlocksStoreActions();
  return useCallback(
    (blockIds: Array<string>, props: Record<string, any>) => {
      updateBlocksRuntime(blockIds, props);
    },
    [updateBlocksRuntime],
  );
};

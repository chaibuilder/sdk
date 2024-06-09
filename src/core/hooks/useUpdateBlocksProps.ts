import { useCallback } from "react";
import { useBlocksStoreActions } from "../history/blocks.ts";

/**
 *
 */
export const useUpdateBlocksProps = () => {
  const { updateBlocks } = useBlocksStoreActions();
  return useCallback(
    (blockIds: Array<string>, props: Record<string, any>) => {
      updateBlocks(blockIds, props);
    },
    [updateBlocks],
  );
};

export const useUpdateBlocksPropsRealtime = () => {
  const { updateBlocksRuntime } = useBlocksStoreActions();
  return useCallback(
    (blockIds: Array<string>, props: { string: any }) => {
      updateBlocksRuntime(blockIds, props);
    },
    [updateBlocksRuntime],
  );
};

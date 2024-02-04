import { useAtomValue } from "jotai";
import { useCallback } from "react";
import { globalBlocksAtom } from "../store/buildingBlocks";
import { useChaiBlocks } from "@chaibuilder/blocks";

const setBlocks = () => {};

export const useBuildingBlocks = (): [Array<any>, Array<any>, () => never, () => never] => {
  const blocks = useChaiBlocks();
  const globalBlocks = useAtomValue(globalBlocksAtom);

  const addGlobalBlock = () => {
    setBlocks();
  };

  /**
   * Update blocks on complete
   */
  const updateGlobalBlocks = useCallback(() => {
    // const blockIds: string[] = map(newGlobalBlocks, "block_id");
    return setBlocks();
  }, []);

  return [blocks as any, globalBlocks, addGlobalBlock as any, updateGlobalBlocks as any];
};

import { useCallback } from "react";
import { useAtom, useAtomValue } from "jotai";
import { pageBlocksAtom, pageBlocksTreeAtom } from "../store/blocks";
import { nestedToFlatArray } from "../functions/Blocks";
import { ChaiBlock } from "../types/ChaiBlock";

export const useDispatch: () => (update?: any) => void = () => {
  const [, dispatch] = useAtom(pageBlocksAtom);
  return dispatch;
};

/**
 * useTreeData hook
 */
export const useTreeData = (): [Array<any>, Function] => {
  const dispatch = useDispatch();
  const treeData: Array<any> = useAtomValue(pageBlocksTreeAtom);

  const setTreeData = useCallback(
    (newTreeData: Array<any>) => {
      const flatBlocks: Array<ChaiBlock> = nestedToFlatArray(newTreeData);
      dispatch({ type: "set_page_blocks", payload: flatBlocks });
    },
    [dispatch],
  );
  return [treeData, setTreeData];
};

export const useSetAllBlocks = (): [Function] => {
  const dispatch = useDispatch();
  const setAllBlocks = useCallback(
    (newBlocks: ChaiBlock[]) => {
      dispatch({ type: "set_page_blocks", payload: newBlocks });
    },
    [dispatch],
  );
  return [setAllBlocks];
};

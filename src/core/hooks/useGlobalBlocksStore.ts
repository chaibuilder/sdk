import { atom, useAtom } from "jotai/index";
import { ChaiBlock } from "../types/ChaiBlock.ts";
import { forEach, get, has } from "lodash-es";
import { useBlocksStore } from "../history/useBlocksStoreUndoableActions.ts";
import { useCallback, useEffect, useMemo } from "react";
import { useBuilderProp } from "./useBuilderProp.ts";

type GlobalBlocksState = Record<
  string,
  {
    loading: boolean;
    error: Error | null | string;
  }
>;

/**
 * Stores the global blocks for the project.
 */
const globalBlocksStoreAtom = atom<Record<string, ChaiBlock[]>>({});
const globalBlocksLoadingStateAtom = atom<GlobalBlocksState>({});

export const useGlobalBlocksStore = () => {
  const [globalBlocks] = useAtom(globalBlocksStoreAtom);
  const getGlobalBlocks = useCallback(
    (block: ChaiBlock) => {
      return get(globalBlocks, block?.globalBlock, []);
    },
    [globalBlocks],
  );
  return { getGlobalBlocks };
};

export const useWatchGlobalBlocks = () => {
  const [blocksStore] = useBlocksStore();
  const [globalBlocks, setGlobalBlocks] = useAtom(globalBlocksStoreAtom);
  const [globalBlocksLoadingState, setGlobalBlocksLoadingState] = useAtom(globalBlocksLoadingStateAtom);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getGlobalBlockBlocks = useBuilderProp("getGlobalBlockBlocks", async (_key: string) => []);
  const globalBlocksList = useMemo(() => {
    const globalBlocks = blocksStore.filter((block) => block._type === "GlobalBlock");
    return globalBlocks.filter((block) => block._type === "GlobalBlock").map((block) => block.globalBlock);
  }, [blocksStore]);

  useEffect(() => {
    forEach(globalBlocksList, (globalBlock: string) => {
      if (has(globalBlocks, globalBlock) || get(globalBlocksLoadingState, `${globalBlock}.loading`, false)) {
        return;
      }
      setGlobalBlocksLoadingState((prevState) => ({ ...prevState, [globalBlock]: { loading: true, error: null } }));
      getGlobalBlockBlocks(globalBlock)
        .then((blocks) => {
          setGlobalBlocks((prevState) => ({ ...prevState, [globalBlock]: blocks }));
          setGlobalBlocksLoadingState((prevState) => ({
            ...prevState,
            [globalBlock]: { loading: false, error: null },
          }));
        })
        .catch((error) => {
          setGlobalBlocksLoadingState((prevState) => ({
            ...prevState,
            [globalBlock]: { loading: false, error: error.message },
          }));
        });
    });
  }, [globalBlocks, globalBlocksList, globalBlocksLoadingState, setGlobalBlocksLoadingState]);
};

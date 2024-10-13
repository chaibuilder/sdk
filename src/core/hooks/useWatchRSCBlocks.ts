import { atom, useAtom } from "jotai/index";
import { ChaiBlock } from "../types/ChaiBlock.ts";
import { forEach, get } from "lodash-es";
import { useBlocksStore } from "../history/useBlocksStoreUndoableActions.ts";
import { useCallback, useEffect, useMemo } from "react";
import { useBuilderProp } from "./useBuilderProp.ts";
import { useChaiBlocks } from "@chaibuilder/runtime";

type ServerBlocksState = Record<
  string,
  {
    loading: boolean;
    error: Error | null | string;
  }
>;

/**
 * Stores the rsc generated block ht.
 */
const rscBlocksStoreAtom = atom<Record<string, string>>({});
const rscBlocksLoadingStateAtom = atom<ServerBlocksState>({});

export const useRSCBlocksStore = () => {
  const [rscBlocks, setRSCBlocks] = useAtom(rscBlocksStoreAtom);
  const [rscBlocksLoadingState] = useAtom(rscBlocksLoadingStateAtom);
  const getRSCBlockMarkup = useCallback(
    (block: ChaiBlock) => {
      return get(rscBlocks, block?._id, null);
    },
    [rscBlocks],
  );
  const getRSCBlockState = useCallback(
    (blockId: string) => {
      return get(rscBlocksLoadingState, `${blockId}`, { loading: false, error: null });
    },
    [rscBlocksLoadingState],
  );
  const reset = useCallback(
    (blockId: string) => {
      setRSCBlocks((prevState) => ({ ...prevState, [blockId]: "" }));
    },
    [setRSCBlocks],
  );

  return { getRSCBlockMarkup, getRSCBlockState, reset };
};

export const useWatchRSCBlocks = () => {
  const [blocksStore] = useBlocksStore();
  const [rscBlocks, setRSCBlocks] = useAtom(rscBlocksStoreAtom);
  const [rscBlocksLoadingState, setRSCBlocksLoadingState] = useAtom(rscBlocksLoadingStateAtom);
  const allChaiBlocks = useChaiBlocks();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getRSCBlockBlock = useBuilderProp("getRSCBlock", async (_block: ChaiBlock) => "");
  const rscBlocksList = useMemo(() => {
    const rscBlocks = blocksStore.filter((block) => {
      const isServerBlock = get(allChaiBlocks, block._type)?.server;
      return isServerBlock;
    });
    return rscBlocks.map((block) => block._id);
  }, [allChaiBlocks, blocksStore]);

  useEffect(() => {
    forEach(rscBlocksList, (rscBlockId: string) => {
      if (get(rscBlocks, rscBlockId, "") || get(rscBlocksLoadingState, `${rscBlockId}.loading`, false)) {
        return;
      }
      const block = blocksStore.find((block) => block._id === rscBlockId);
      setRSCBlocksLoadingState((prevState) => ({ ...prevState, [rscBlockId]: { loading: true, error: null } }));
      getRSCBlockBlock(block)
        .then((html: string) => {
          setRSCBlocks((prevState) => ({ ...prevState, [rscBlockId]: html }));
          setRSCBlocksLoadingState((prevState) => ({
            ...prevState,
            [rscBlockId]: { loading: false, error: null },
          }));
        })
        .catch((error) => {
          setRSCBlocksLoadingState((prevState) => ({
            ...prevState,
            [rscBlockId]: { loading: false, error: error.message },
          }));
        });
    });
  }, [
    blocksStore,
    getRSCBlockBlock,
    rscBlocks,
    rscBlocksList,
    rscBlocksLoadingState,
    setRSCBlocks,
    setRSCBlocksLoadingState,
  ]);
};

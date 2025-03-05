import { atom, useAtom } from "jotai/index";
import { forEach, get, has } from "lodash-es";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useBlocksStore } from "../history/useBlocksStoreUndoableActions.ts";
import { ChaiBlock } from "../types/ChaiBlock.ts";
import { useBuilderProp } from "./useBuilderProp.ts";

type PartialBlocksState = Record<
  string,
  {
    loading: boolean;
    error: Error | null | string;
  }
>;

/**
 * Stores the global blocks for the project.
 */
const partialBlocksStoreAtom = atom<Record<string, ChaiBlock[]>>({});
const partialBlocksLoadingStateAtom = atom<PartialBlocksState>({});

export const usePartailBlocksStore = () => {
  const [partailBlocks, setPartailBlocks] = useAtom(partialBlocksStoreAtom);
  const getPartailBlocks = useCallback((partailBlock: string) => get(partailBlocks, partailBlock, []), [partailBlocks]);
  const reset = useCallback(() => setPartailBlocks({}), [setPartailBlocks]);
  return { getPartailBlocks, reset };
};

export const useWatchPartailBlocks = () => {
  const [allBlocks] = useBlocksStore();
  const [partailBlocks, setPartailBlocks] = useAtom(partialBlocksStoreAtom);
  const [partailBlocksLoadingState, setPartailBlocksLoadingState] = useAtom(partialBlocksLoadingStateAtom);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getPartialBlockBlocks = useBuilderProp("getPartialBlockBlocks", async (_key: string) => []);
  const partialBlocksList = useMemo(() => {
    const partialBlocks = allBlocks.filter((block) => block._type === "PartialBlock");
    return partialBlocks.map((block) => block.partialBlockId);
  }, [allBlocks]);

  useEffect(() => {
    forEach(partialBlocksList, (partialBlock: string) => {
      if (has(partailBlocks, partialBlock) || get(partailBlocksLoadingState, `${partialBlock}.loading`, false)) {
        return;
      }
      setPartailBlocksLoadingState((prevState) => ({ ...prevState, [partialBlock]: { loading: true, error: null } }));
      getPartialBlockBlocks(partialBlock)
        .then((blocks) => {
          setPartailBlocks((prevState) => ({ ...prevState, [partialBlock]: blocks }));
          setPartailBlocksLoadingState((prevState) => ({
            ...prevState,
            [partialBlock]: { loading: false, error: null },
          }));
        })
        .catch((error) => {
          setPartailBlocksLoadingState((prevState) => ({
            ...prevState,
            [partialBlock]: { loading: false, error: error.message },
          }));
        });
    });
  }, [
    getPartialBlockBlocks,
    partailBlocks,
    partailBlocksLoadingState,
    setPartailBlocks,
    setPartailBlocksLoadingState,
    partialBlocksList,
  ]);
};

type PartialBlockList = Record<string, { name?: string; description?: string }>;
const partialBlocksListAtom = atom<PartialBlockList>({});
export const usePartialBlocksList = () => {
  const [loading, setLoading] = useState(false);
  const [partialBlocksList, setPartialBlocksList] = useAtom(partialBlocksListAtom);
  const getPartialBlocks = useBuilderProp("getPartialBlocks", async () => []);
  const fetchPartialBlocks = useCallback(async () => {
    setLoading(true);
    const partialBlocks = await getPartialBlocks();
    setPartialBlocksList(partialBlocks as any);
    setLoading(false);
  }, [getPartialBlocks, setPartialBlocksList]);

  useEffect(() => {
    fetchPartialBlocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data: partialBlocksList, isLoading: loading, refetch: fetchPartialBlocks };
};

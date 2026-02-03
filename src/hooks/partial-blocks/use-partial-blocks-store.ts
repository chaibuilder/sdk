import { ChaiBlock } from "@/types/common";
import { useAtom } from "jotai";
import { get } from "lodash-es";
import { useCallback } from "react";
import { partialBlocksAtom } from "./atoms";

export const usePartialBlocksStore = () => {
  const [partialBlocks, setPartialBlocks] = useAtom(partialBlocksAtom);
  const getPartailBlocks = useCallback(
    (partialBlockId: string) => get(partialBlocks, `${partialBlockId}.blocks`, []) as ChaiBlock[],
    [partialBlocks],
  );
  const reset = useCallback(() => setPartialBlocks({}), [setPartialBlocks]);
  return { getPartailBlocks, reset };
};

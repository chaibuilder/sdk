import { useAtomValue } from "jotai";
import { useCallback, useMemo } from "react";
import { get, includes, isEmpty, map, set } from "lodash-es";
import { useDuplicateBlocks } from "./useDuplicateBlocks";
import { copiedBlockIdsAtom } from "./useCopyBlockIds";
import { useCutBlockIds } from "./useCutBlockIds";
import { presentBlocksAtom } from "../atoms/blocks";
import { ChaiBlock } from "../types/ChaiBlock.ts";

const useMoveCutBlocks = () => {
  const presentBlocks = useAtomValue(presentBlocksAtom);
  return useCallback(
    (blockIds: Array<string>, newParentId: string) => {
      const newBlocks = map(presentBlocks, (block: ChaiBlock) => {
        if (includes(blockIds, get(block, "_id"))) {
          set(block, "_parent", newParentId);
        }
        return block;
      });
      console.log("newBlocks", newBlocks);
    },
    [presentBlocks],
  );
};

export const usePasteBlocks = (): {
  canPaste: boolean;
  pasteBlocks: Function;
} => {
  console.warn("usePasteBlocks is not implemented");
  // @ts-ignore
  const copiedBlockIds: Array<string> = useAtomValue(copiedBlockIdsAtom);
  const [cutBlockIds, setCutBlockIds] = useCutBlockIds();
  const duplicateBlocks = useDuplicateBlocks();
  const moveCutBlocks = useMoveCutBlocks();
  const canPaste = useMemo<boolean>(
    () => cutBlockIds.length > 0 || copiedBlockIds.length > 0,
    [copiedBlockIds, cutBlockIds],
  );
  return {
    canPaste,
    pasteBlocks: useCallback(
      (newParentId: string) => {
        if (!isEmpty(copiedBlockIds)) {
          duplicateBlocks(copiedBlockIds, newParentId);
        } else {
          moveCutBlocks(cutBlockIds, newParentId);
        }
        setCutBlockIds(() => []);
      },
      [cutBlockIds, copiedBlockIds, duplicateBlocks, moveCutBlocks, setCutBlockIds],
    ),
  };
};

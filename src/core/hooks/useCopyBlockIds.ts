import { atom, useAtom, useSetAtom } from "jotai";
import { useCallback } from "react";
import { cutBlockIdsAtom } from "./useCutBlockIds";
import { getDuplicatedBlocks } from "../functions/Blocks";
import { useBlocksStore } from "./hooks";

export const copiedBlockIdsAtom: any = atom<Array<string>>([]);

export interface CopiedBlock {
  id: string;
  data: any;
}

export interface ClipboardBlock {
  _chai_copied_blocks: any[];
  parentId: string | null;
}

export const useCopyBlockIds = (): [Array<string>, (blockIds: Array<string>) => void] => {
  const [ids, setIds] = useAtom(copiedBlockIdsAtom);
  const resetCutBlockIds = useSetAtom(cutBlockIdsAtom);
  const [presentBlocks] = useBlocksStore();

  const setCopiedBlockIds = useCallback(
    async (blockIds: Array<string>) => {
      try {
        setIds(blockIds);
        resetCutBlockIds([]);

        const clipboardData: ClipboardBlock[] = blockIds.map((blockId) => {
          const block = presentBlocks.find((b) => b._id === blockId);
          const parentId = block?._parent;

          // Get duplicated blocks with children
          const duplicatedBlocks = getDuplicatedBlocks(presentBlocks, blockId, null);

          return {
            "_chai_copied_blocks": duplicatedBlocks,
            parentId,
          };
        });

        await navigator.clipboard.writeText(JSON.stringify(clipboardData));
      } catch (error) {
        console.error("Failed to copy blocks to clipboard:", error);
      }
    },
    [setIds, resetCutBlockIds, presentBlocks],
  );

  return [ids as string[], setCopiedBlockIds];
};

import { atom, useAtom, useSetAtom } from "jotai";
import { useCallback } from "react";
import { cutBlockIdsAtom } from "./useCutBlockIds";

export const copiedBlockIdsAtom: any = atom<Array<string>>([]);

export interface CopiedBlock {
  id: string;
  data: any;
}

export const useCopyBlockIds = (): [Array<string>, (blocks: Array<CopiedBlock>) => void] => {
  const [ids, setIds] = useAtom(copiedBlockIdsAtom);
  const resetCutBlockIds = useSetAtom(cutBlockIdsAtom);

  const setCopiedBlockIds = useCallback(
    (blocks: Array<CopiedBlock>) => {
      const blockIds = blocks.map(block => block.id);
      setIds(blockIds);
      resetCutBlockIds([]);
      
      // Store blocks data in session storage
      sessionStorage.setItem('_chai_copied_blocks', JSON.stringify(blocks));
    },
    [setIds, resetCutBlockIds],
  );

  return [ids as string[], setCopiedBlockIds];
};

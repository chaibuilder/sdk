import { cutBlockIdsAtom } from "@/core/hooks/use-cut-blockIds";
import { atom, useAtom, useSetAtom } from "jotai";
import { useCallback } from "react";
import { toast } from "sonner";

export const copiedBlockIdsAtom: any = atom<Array<string>>([]);

export interface CopiedBlock {
  id: string;
  data: any;
}

export interface ClipboardBlock {
  _chai_copied_blocks: any;
}

export const useCopyBlockIds = (): [Array<string>, (blockIds: Array<string>) => void] => {
  const [ids, setIds] = useAtom(copiedBlockIdsAtom);
  const resetCutBlockIds = useSetAtom(cutBlockIdsAtom);

  const setCopiedBlockIds = useCallback(
    async (blockIds: Array<string>) => {
      setIds(blockIds);
      resetCutBlockIds([]);
      toast.success("Blocks copied");
    },
    [setIds, resetCutBlockIds],
  );

  return [ids as string[], setCopiedBlockIds];
};

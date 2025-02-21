import { useAtomCallback } from "jotai/utils";
import { find } from "lodash-es";
import { useCallback } from "react";
import { pageBlocksAtom } from "../atoms/blocks";
import { ChaiBlock } from "../types/ChaiBlock.ts";
export const useUpdateBlockAtom = () => {
  return useAtomCallback(
    useCallback((get, set, { id, props }: { id: string; props: Record<string, any> }) => {
      const blockAsAtoms = get(pageBlocksAtom);
      const blockAtom = find(blockAsAtoms, (b) => b._id === id);
      if (!blockAtom) {
        console.warn(`Block with id ${id} not found`);
        return;
      }
      return set(blockAtom._atom, { ...(get(blockAtom._atom) as any), ...props });
    }, []),
  );
};

export const useGetBlockAtomValue = () => {
  return useAtomCallback(
    useCallback((get, _set, id: string) => {
      const blockAsAtoms = get(pageBlocksAtom);
      const blockAtom = find(blockAsAtoms, (b) => b._id === id);
      if (!blockAtom) {
        console.warn(`Block with id ${id} not found`);
        return;
      }
      return get(blockAtom._atom) as ChaiBlock;
    }, []),
  );
};

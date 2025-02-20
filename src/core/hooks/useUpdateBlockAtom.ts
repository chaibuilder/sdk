import { useAtomCallback } from "jotai/utils";
import { find } from "lodash-es";
import { useCallback } from "react";
import { blocksAsAtomsAtom } from "../atoms/blocks";

export const useUpdateBlockAtom = () => {
  return useAtomCallback(
    useCallback((get, set, { id, props }: { id: string; props: Record<string, any> }) => {
      const blockAsAtoms = get(blocksAsAtomsAtom);
      const blockAtom = find(blockAsAtoms, (b) => b._id === id);
      if (!blockAtom) {
        console.warn(`Block with id ${id} not found`);
        return;
      }
      return set(blockAtom.atom, { ...(get(blockAtom.atom) as any), ...props });
    }, []),
  );
};

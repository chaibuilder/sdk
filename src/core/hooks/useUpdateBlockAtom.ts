import { atom, useSetAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { find } from "lodash-es";
import { useCallback } from "react";
import { pageBlocksAtom } from "../atoms/blocks";
import { ChaiBlock } from "../types/ChaiBlock.ts";

const writeAtomValue = atom(
  null, // it's a convention to pass `null` for the first argument
  (get, set, { id, props }: { id: string; props: Record<string, any> }) => {
    const blockAsAtoms = get(pageBlocksAtom);
    console.log("From Atom callback", blockAsAtoms);
    const blockAtom = find(blockAsAtoms, (b) => b._id === id);
    if (!blockAtom) {
      throw new Error(`Block with id ${id} not found`);
    }
    return set(blockAtom._atom, { ...(get(blockAtom._atom) as any), ...props });
  },
);

export const useUpdateBlockAtom = () => {
  return useSetAtom(writeAtomValue);
};

export const useGetBlockAtomValue = () => {
  return useAtomCallback(
    useCallback((get, _set, id: string) => {
      const blockAsAtoms = get(pageBlocksAtom);
      console.log("Block As Atoms", blockAsAtoms);
      const blockAtom = find(blockAsAtoms, (b) => b._id === id);
      if (!blockAtom) {
        throw new Error(`Block with id ${id} not found`);
      }
      return get(blockAtom._atom) as ChaiBlock;
    }, []),
  );
};

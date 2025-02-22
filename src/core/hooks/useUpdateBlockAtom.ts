import { useAtomCallback } from "jotai/utils";
import { find } from "lodash-es";
import { useCallback } from "react";
import { pageBlocksAtom } from "../atoms/blocks";
import { ChaiBlock } from "../types/ChaiBlock.ts";
import { useBlocksStore } from "./hooks.ts";

export const useUpdateBlockAtom = () => {
  const [blocks] = useBlocksStore();
  console.log("Default Blocks: ", blocks);
  return useAtomCallback(
    useCallback(
      (get, set, { id, props }: { id: string; props: Record<string, any> }) => {
        const blockAsAtoms = get(pageBlocksAtom);
        console.log("From Atom callback", blocks);
        const blockAtom = find(blockAsAtoms, (b) => b._id === id);
        if (!blockAtom) {
          console.warn(`Block with id ${id} not found`);
          return;
        }
        return set(blockAtom._atom, { ...(get(blockAtom._atom) as any), ...props });
      },
      [pageBlocksAtom],
    ),
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

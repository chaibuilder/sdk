import { useAtomCallback } from "jotai/utils";
import { find } from "lodash-es";
import { useCallback } from "react";
import { pageBlocksAtomsAtom } from "../atoms/blocks";

export const useAtomSetterCb = () => {
  return useAtomCallback(
    useCallback((get, set, id: string) => {
      const blockAtoms = get(pageBlocksAtomsAtom);
      const blockAtom = find(blockAtoms, (atom) => (get(atom) as any)._id === id);
      return (props: any) => set(blockAtom, { ...(get(blockAtom) as any), ...props });
    }, []),
  );
};

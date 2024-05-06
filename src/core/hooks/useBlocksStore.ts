import { useAtom } from "jotai";
import { presentBlocksAtom } from "../atoms/blocks.ts";

export const useBlocksStore = () => {
  return useAtom(presentBlocksAtom);
};

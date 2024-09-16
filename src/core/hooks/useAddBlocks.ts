import { useAtom } from "jotai/index";
import { addBlockModalOpenAtom } from "../atoms/ui.ts";

export const useAddBlocksModal = () => {
  return useAtom(addBlockModalOpenAtom);
};

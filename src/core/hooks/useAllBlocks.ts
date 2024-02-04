import { useAtomValue } from "jotai";
import { presentBlocksAtom } from "../store/blocks";
import { ChaiBlock } from "../types/ChaiBlock";

/**
 * useTreeData hook
 */
export const useAllBlocks = (): ChaiBlock[] => useAtomValue(presentBlocksAtom);

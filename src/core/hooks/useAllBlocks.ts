import { useAtomValue } from "jotai";
import { presentBlocksAtom } from "../atoms/blocks";
import { ChaiBlock } from "../types/ChaiBlock";

/**
 * useTreeData hook
 */
export const useAllBlocks = (): ChaiBlock[] => useAtomValue(presentBlocksAtom);

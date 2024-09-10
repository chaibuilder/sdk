import { atom } from "jotai";
import { ChaiBlock } from "../../../types/ChaiBlock.ts";

export const draggedBlockAtom = atom<ChaiBlock | null>(null);

export const dropTargetBlockIdAtom = atom<string | null>(null);

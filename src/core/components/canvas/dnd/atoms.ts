import { ChaiBlock } from "@/types/chai-block.ts";
import { atom } from "jotai";

export const draggedBlockAtom = atom<ChaiBlock | null>(null);

export const dropTargetBlockIdAtom = atom<string | null>(null);

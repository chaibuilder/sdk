import { ChaiBlock } from "@/types/chai-block";
import { atom } from "jotai";

export const draggedBlockAtom = atom<ChaiBlock | null>(null);

export const dropTargetBlockIdAtom = atom<string | null>(null);

import { atomWithStorage } from "jotai/utils";

export const lsBlocksAtom = atomWithStorage("chai-builder-blocks", []);
export const lsThemeAtom = atomWithStorage("chai-builder-theme", {});
export const lsAiContextAtom = atomWithStorage("chai-builder-ai-context", "");

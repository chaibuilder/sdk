import { atomWithStorage } from "jotai/utils";

export const lsBlocksAtom = atomWithStorage("chai-builder-blocks", []);
export const lsBrandingOptionsAtom = atomWithStorage("chai-builder-branding-options", {});
export const lsProvidersAtom = atomWithStorage("chai-builder-providers", []);
export const lsContainer = atomWithStorage("chai-builder-container", null);

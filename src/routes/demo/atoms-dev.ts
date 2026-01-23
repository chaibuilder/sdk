import { defaultThemeValues } from "@/hooks/default-theme-options";
import { ChaiTheme } from "@/types";
import { ChaiDesignTokens } from "@/types/types";
import { atomWithStorage } from "jotai/utils";

export const lsBlocksAtom = atomWithStorage("chai-builder-blocks", []);
export const lsThemeAtom = atomWithStorage<ChaiTheme>("chai-builder-theme", defaultThemeValues);
export const lsDesignTokensAtom = atomWithStorage<ChaiDesignTokens>("chai-builder-design-tokens", {});
export const lsAiContextAtom = atomWithStorage("chai-builder-ai-context", "");

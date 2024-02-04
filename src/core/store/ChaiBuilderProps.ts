import { atom } from "jotai";

import { ChaiBuilderEditorProps } from "../types/chaiBuilderEditorProps.ts";

export const chaiBuilderPropsAtom = atom<Omit<
  ChaiBuilderEditorProps,
  "blocks" | "globalBlocks" | "brandingOptions"
> | null>(null);
chaiBuilderPropsAtom.debugLabel = "chaiBuilderPropsAtom";

export const apiKeyAtom = atom<string | null>(null);
apiKeyAtom.debugLabel = "apiKeyAtom";

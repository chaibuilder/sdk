import { atom } from "jotai";
import { ChaiBuilderEditorProps } from "../types";

export const chaiBuilderPropsAtom = atom<Omit<
  ChaiBuilderEditorProps,
  "blocks" | "globalBlocks" | "brandingOptions"
> | null>(null);
chaiBuilderPropsAtom.debugLabel = "chaiBuilderPropsAtom";

export const chaiExternalDataAtom = atom({});
chaiExternalDataAtom.debugLabel = "chaiExternalDataAtom";

export const chaiRjsfFieldsAtom = atom<Record<string, React.ComponentType<any>>>({});
chaiRjsfFieldsAtom.debugLabel = "chaiRjsfFieldsAtom";

export const chaiRjsfWidgetsAtom = atom<Record<string, React.ComponentType<any>>>({});
chaiRjsfWidgetsAtom.debugLabel = "chaiRjsfWidgetsAtom";

export const chaiRjsfTemplatesAtom = atom<Record<string, React.ComponentType<any>>>({});
chaiRjsfTemplatesAtom.debugLabel = "chaiRjsfTemplatesAtom";

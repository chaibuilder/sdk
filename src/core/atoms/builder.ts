import { useBlockRepeaterDataAtom } from "@/core/async-props/use-async-props";
import { ChaiBuilderEditorProps } from "@/types";
import { atom, useAtomValue } from "jotai";
import { useMemo } from "react";

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

export const chaiPageExternalDataAtom = atom<Record<string, any>>({});
chaiPageExternalDataAtom.debugLabel = "chaiPageExternalDataAtom";

export const usePageExternalData = () => {
  const [blockRepeaterData] = useBlockRepeaterDataAtom();
  const repeaterItems = useMemo(() => {
    const result = {};
    Object.entries(blockRepeaterData).forEach(([key, value]) => {
      if (value.status === "loaded")
        result[value.repeaterItems.replace("}}", `/${key}`).replace("{{", "")] = value.props;
    });
    return result;
  }, [blockRepeaterData]);
  const pageExternalData = useAtomValue(chaiPageExternalDataAtom);
  return { ...pageExternalData, ...repeaterItems };
};

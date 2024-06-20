import { useAtomValue } from "jotai";
import { get } from "lodash-es";
import { chaiBuilderPropsAtom } from "../atoms/builder.ts";
import { ChaiBuilderEditorProps } from "../types/chaiBuilderEditorProps.ts";

type ExcludedBuilderProps =
  | "blocks"
  | "subPages"
  | "brandingOptions"
  | "dataProviders"
  | "onSaveBrandingOptions"
  | "onSaveBlocks";

export const useBuilderProp = <T>(
  propKey: keyof Omit<ChaiBuilderEditorProps, ExcludedBuilderProps>,
  defaultValue: T = undefined,
): T => {
  const builderProps = useAtomValue(chaiBuilderPropsAtom);
  return get(builderProps, propKey, defaultValue);
};

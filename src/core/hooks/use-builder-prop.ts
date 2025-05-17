import { chaiBuilderPropsAtom } from "@/core/atoms/builder";
import { ChaiBuilderEditorProps } from "@/types/chaibuilder-editor-props";
import { useAtomValue } from "jotai";
import { get } from "lodash-es";
import { useMemo } from "react";

type ExcludedBuilderProps = "blocks" | "subPages" | "brandingOptions" | "dataProviders";

export const useBuilderProp = <T>(
  propKey: keyof Omit<ChaiBuilderEditorProps, ExcludedBuilderProps> | "languages",
  defaultValue: T = undefined,
): T => {
  const builderProps = useAtomValue(chaiBuilderPropsAtom);
  return useMemo(() => get(builderProps, propKey, defaultValue), [builderProps, propKey, defaultValue]);
};

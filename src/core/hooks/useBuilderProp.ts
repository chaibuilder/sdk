import { useAtomValue } from "jotai";
import { get } from "lodash-es";
import { ChaiBuilderEditorProps } from "../../types/chaibuilder-editor-props.ts";
import { chaiBuilderPropsAtom } from "../atoms/builder.ts";

type ExcludedBuilderProps = "blocks" | "subPages" | "brandingOptions" | "dataProviders";

export const useBuilderProp = <T>(
  propKey:
    | keyof Omit<ChaiBuilderEditorProps, ExcludedBuilderProps>
    | "sideBarComponents.top"
    | "sideBarComponents.bottom"
    | "topBarComponents.left"
    | "topBarComponents.right"
    | "topBarComponents.center"
    | "languages",
  defaultValue: T = undefined,
): T => {
  const builderProps = useAtomValue(chaiBuilderPropsAtom);
  return get(builderProps, propKey, defaultValue);
};

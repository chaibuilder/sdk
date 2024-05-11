import { useAtom } from "jotai";
import { get } from "lodash-es";
import { chaiBuilderPropsAtom } from "../atoms/builder.ts";

export const useFeatureSupport = (feature: string, defaultValue: boolean) => {
  const [builderProps] = useAtom(chaiBuilderPropsAtom);
  return get(builderProps, feature, defaultValue);
};

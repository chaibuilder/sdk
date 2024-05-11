import { useAtomValue } from "jotai";
import { get } from "lodash-es";
import { chaiBuilderPropsAtom } from "../atoms/builder.ts";

export const useBuilderProp = (propKey: string, defaultValue: any = undefined) => {
  const builderProps = useAtomValue(chaiBuilderPropsAtom);
  return get(builderProps, propKey, defaultValue);
};

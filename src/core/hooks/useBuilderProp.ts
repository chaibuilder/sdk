import { useAtomValue } from "jotai";
import { get } from "lodash";
import { chaiBuilderPropsAtom } from "../store/ChaiBuilderProps";

export const useBuilderProp = (propKey: string, defaultValue: any = undefined) => {
  const builderProps = useAtomValue(chaiBuilderPropsAtom);
  return get(builderProps, propKey, defaultValue);
};

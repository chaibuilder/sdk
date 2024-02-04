import { useMemo } from "react";
import { getChaiDataProviders } from "@chaibuilder/blocks";

export const useAllDataProviders = () => {
  return useMemo(() => getChaiDataProviders(), []);
};

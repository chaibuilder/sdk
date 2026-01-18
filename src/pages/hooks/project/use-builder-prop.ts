import { get } from "lodash-es";
import { useMemo } from "react";
import { usePagesProps } from "@/pages/hooks/utils/use-pages-props";

export const usePagesProp = <T>(key: string, defaultValue?: T) => {
  const [pagesProps] = usePagesProps();
  return useMemo(() => get(pagesProps, key, defaultValue), [pagesProps, key, defaultValue]);
};

export const useApiUrl = () => {
  return usePagesProp("apiUrl", "/chai/api") as string;
};

export const useWebsocket = () => {
  return usePagesProp("websocket", null) as any | null;
};

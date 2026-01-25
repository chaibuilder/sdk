import { get } from "lodash-es";
import { useMemo } from "react";
import { usePagesProps } from "@/pages/hooks/utils/use-pages-props";
import type { RealtimeAdapter } from "@/pages/client/components/page-lock/realtime-adapter";

export const usePagesProp = <T>(key: string, defaultValue?: T) => {
  const [pagesProps] = usePagesProps();
  return useMemo(() => get(pagesProps, key, defaultValue), [pagesProps, key, defaultValue]);
};

export const useApiUrl = () => {
  return usePagesProp("apiUrl", "/chai/api") as string;
};

/**
 * @deprecated Use useRealtimeAdapter instead. This will be removed in future versions.
 */
export const useWebsocket = () => {
  return usePagesProp("websocket", null) as any | null;
};

export const useRealtimeAdapter = () => {
  return usePagesProp("realtimeAdapter", null) as RealtimeAdapter | null;
};

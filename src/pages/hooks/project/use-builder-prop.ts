import { get } from "lodash-es";
import { useMemo } from "react";
import { usePagesProps } from "@/pages/hooks/utils/use-pages-props";
import type { RealtimeAdapter } from "@/pages/client/components/page-lock/realtime-adapter";
import { SupabaseRealtimeAdapter } from "@/pages/client/components/page-lock/supabase-realtime-adapter";

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

/**
 * Get the realtime adapter for page lock functionality.
 * 
 * This hook automatically provides backward compatibility by wrapping
 * any legacy `websocket` prop with a SupabaseRealtimeAdapter.
 * 
 * @returns RealtimeAdapter instance or null
 */
export const useRealtimeAdapter = (): RealtimeAdapter | null => {
  const realtimeAdapter = usePagesProp("realtimeAdapter", null) as RealtimeAdapter | null;
  const legacyWebsocket = usePagesProp("websocket", null) as any | null;

  return useMemo(() => {
    // If realtimeAdapter is provided, use it
    if (realtimeAdapter) return realtimeAdapter;

    // For backward compatibility: wrap legacy websocket with SupabaseRealtimeAdapter
    if (legacyWebsocket) {
      return new SupabaseRealtimeAdapter(legacyWebsocket);
    }

    return null;
  }, [realtimeAdapter, legacyWebsocket]);
};

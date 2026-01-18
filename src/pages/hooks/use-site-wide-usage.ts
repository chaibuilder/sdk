import { useQuery } from "@tanstack/react-query";
import { useApiUrl } from "./project/use-builder-prop";
import { QUERY_KEYS } from "./QUERY_KEYS";
import { useFetch } from "./utils/use-fetch";

type BlocksWithDesignTokens = Record<string, string>;
export interface SiteWideUsage {
  [pageId: string]: {
    name: string;
    isPartial: boolean;
    partialBlocks: string[];
    links: string[];
    designTokens: BlocksWithDesignTokens; // { blockId: Name, blockId: name 2}
  };
}

export const useSiteWideUsage = (designTokens: boolean) => {
  const fetch = useFetch();
  const apiUrl = useApiUrl();
  return useQuery({
    queryKey: [QUERY_KEYS.SITE_WIDE_USAGE],
    queryFn: async () => {
      if (!designTokens) {
        return {};
      }
      return fetch(apiUrl, { action: `GET_SITE_WIDE_USAGE` });
    },
    retry: false,
  });
};

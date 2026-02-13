import { ACTIONS } from "@/pages/constants/ACTIONS";
import { useApiUrl } from "@/pages/hooks/project/use-builder-prop";
import { useFetch } from "@/pages/hooks/utils/use-fetch";
import { useSearchParams } from "@/pages/hooks/utils/use-search-params";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { reverse, sortBy } from "lodash-es";

export const useLanguagePages = (pageId?: string | undefined) => {
  const apiUrl = useApiUrl();
  const [searchParams] = useSearchParams();
  const page = pageId ?? searchParams.get("page");
  const fetchAPI = useFetch();
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: [ACTIONS.GET_LANGUAGE_PAGES, page],
    staleTime: Infinity,
    gcTime: 0,
    placeholderData: [],
    queryFn: async () => {
      if (!page) return null;
      
      // First check if data is already in cache (populated by usePageAllData)
      const cachedData = queryClient.getQueryData([ACTIONS.GET_LANGUAGE_PAGES, page]);
      
      let data;
      if (cachedData) {
        // Use cached data
        data = cachedData;
      } else {
        // Fallback to direct API call if cache is empty
        data = await fetchAPI(apiUrl, {
          action: ACTIONS.GET_LANGUAGE_PAGES,
          data: { id: page },
        });
      }
      
      return reverse(sortBy(data, "primaryPage"));
    },
    enabled: !!page,
  });
};

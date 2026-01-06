import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ChaiBuilderPageType } from "../../../server/types";
import { ACTIONS } from "../../constants/ACTIONS";
import { useFetch } from "../utils/use-fetch";
import { useApiUrl } from "./use-builder-prop";

export const usePageTypes = () => {
  const apiUrl = useApiUrl();
  const fetchAPI = useFetch();
  return useQuery({
    queryKey: [ACTIONS.GET_PAGE_TYPES],
    staleTime: Infinity,
    placeholderData: [],
    queryFn: async () => {
      return fetchAPI(apiUrl, { action: ACTIONS.GET_PAGE_TYPES });
    },
  });
};

export const usePageType = (pageType: string) => {
  const { data: pageTypes } = usePageTypes();
  return useMemo(() => pageTypes?.find((type: ChaiBuilderPageType) => type.key === pageType), [pageTypes, pageType]);
};

export const useSearchPageTypePages = () => {
  const apiUrl = useApiUrl();
  const fetchAPI = useFetch();
  return useMutation({
    mutationFn: async ({ pageType, query }: any) => {
      try {
        return (
          fetchAPI(apiUrl, {
            action: ACTIONS.SEARCH_PAGES,
            data: {
              pageType,
              query: Array.isArray(query) && query.length > 0 ? query[0] : query,
            },
          }) || []
        );
      } catch (_error) {
        console.error(_error);
        return [];
      }
    },
  });
};

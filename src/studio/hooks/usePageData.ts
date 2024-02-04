import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useApiBaseUrl } from "./useApiBaseUrl.ts";
import { useCurrentPage } from "./useCurrentPage.ts";
import { fetchWrapper } from "../fetch.ts";

export const usePageData = (): UseQueryResult<null | any> => {
  const [currentPageUid] = useCurrentPage();
  const baseUrl = useApiBaseUrl();
  return useQuery({
    queryKey: ["page_data", currentPageUid],
    queryFn: async () => {
      const { data: response } = await fetchWrapper
        .get(`${baseUrl}/page?uuid=${currentPageUid}`)
        .then((res) => res.json());
      return response;
    },
    enabled: !!currentPageUid,
    staleTime: 3000,
  });
};

import { useQuery } from "@tanstack/react-query";
import { ChaiWebsiteSetting } from "../../../server/types";
import { ACTIONS } from "../../constants/ACTIONS";
import { useFetch } from "../utils/use-fetch";
import { useApiUrl } from "./use-builder-prop";

export const useWebsiteSetting = () => {
  const apiUrl = useApiUrl();
  const fetchAPI = useFetch();
  return useQuery<ChaiWebsiteSetting>({
    queryKey: [ACTIONS.GET_WEBSITE_DRAFT_SETTINGS],
    staleTime: 5 * 60 * 1000,
    placeholderData: {
      languages: [],
      theme: { fontFamily: "", borderRadius: "", colors: {} },
      appKey: "",
      fallbackLang: "",
      designTokens: {},
    },
    queryFn: async () => {
      return fetchAPI(apiUrl, {
        action: ACTIONS.GET_WEBSITE_DRAFT_SETTINGS,
        data: { draft: true },
      });
    },
  });
};

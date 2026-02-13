import { useIsPageLoaded } from "@/hooks/use-is-page-loaded";
import { ACTIONS } from "@/pages/constants/ACTIONS";
import { useAiContext } from "@/pages/hooks/ai/use-ai-context";
import {
  useActivePage,
  useChaiCurrentPage,
  usePageEditInfo,
  usePageMetaData,
} from "@/pages/hooks/pages/use-current-page";
import { useApiUrl } from "@/pages/hooks/project/use-builder-prop";
import { useFallbackLang } from "@/pages/hooks/use-fallback-lang";
import { useFetch } from "@/pages/hooks/utils/use-fetch";
import { useSearchParams } from "@/pages/hooks/utils/use-search-params";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { find, get } from "lodash-es";
import { useDynamicPageSlug } from "./use-dynamic-page-selector";
import { usePageAllData } from "./use-page-all-data";

export const usePageDraftBlocks = () => {
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page");
  const apiUrl = useApiUrl();
  const { setAiContext } = useAiContext();
  const [, setPageEditInfo] = usePageEditInfo();
  const [, setPageMetaData] = usePageMetaData();
  const [, setPageLoaded] = useIsPageLoaded();
  const fetchAPI = useFetch();
  const queryClient = useQueryClient();
  
  // Trigger the consolidated fetch
  usePageAllData();
  
  return useQuery({
    queryKey: [ACTIONS.GET_DRAFT_PAGE, page],
    staleTime: Infinity,
    gcTime: 0,
    queryFn: async () => {
      // First check if data is already in cache (populated by usePageAllData)
      const cachedData = queryClient.getQueryData([ACTIONS.GET_DRAFT_PAGE, page]);
      
      let data: any;
      if (cachedData) {
        // Use cached data
        data = cachedData;
      } else {
        // Fallback to direct API call if cache is empty
        setPageLoaded(false);
        data = await fetchAPI(apiUrl, {
          action: ACTIONS.GET_DRAFT_PAGE,
          data: { id: page, draft: true },
        });
      }
      
      // if page is locked, return empty array
      const blocks = data.blocks ?? [];
      const aiContextBlock = find(blocks, { _type: "@chai/ai-context" });
      setAiContext(get(aiContextBlock, "_value", "") || "");
      setPageEditInfo((prev) => ({ ...prev, lastSaved: data.lastSaved }));
      setPageMetaData(get(data, "metadata", {}));
      setTimeout(() => setPageLoaded(true), 500);
      return blocks;
    },
    enabled: !!page,
  });
};

export const useBuilderPageData = () => {
  const { data: currentPage } = useChaiCurrentPage();
  const { data: activePage } = useActivePage();
  const apiUrl = useApiUrl();
  const fetchAPI = useFetch();
  const fallbackLang = useFallbackLang();
  const dynamicPageSlug = useDynamicPageSlug();
  const queryClient = useQueryClient();
  
  // Trigger the consolidated fetch
  usePageAllData();

  return useQuery({
    queryKey: [ACTIONS.GET_BUILDER_PAGE_DATA, activePage?.id, dynamicPageSlug],
    staleTime: Infinity,
    gcTime: 0,
    queryFn: async () => {
      // First check if data is already in cache (populated by usePageAllData)
      const cachedData = queryClient.getQueryData([ACTIONS.GET_BUILDER_PAGE_DATA, activePage?.id, dynamicPageSlug]);
      
      if (cachedData) {
        // Use cached data
        return cachedData;
      }
      
      // Fallback to direct API call if cache is empty
      return fetchAPI(apiUrl, {
        action: ACTIONS.GET_BUILDER_PAGE_DATA,
        data: {
          pageType: currentPage?.pageType,
          lang: activePage?.lang || fallbackLang,
          dynamic: currentPage?.dynamic,
          pageProps: {
            slug: activePage?.slug + dynamicPageSlug,
            searchParams: {},
            pageType: activePage?.pageType,
            fallbackLang,
            lastSaved: activePage.lastSaved,
            pageId: currentPage.id,
            primaryPageId: activePage.primaryPage || currentPage.id,
            pageBaseSlug: activePage?.slug,
            dynamic: currentPage?.dynamic,
            //
            languagePageId: activePage.id,
            metadata: currentPage.metadata || {},
          },
        },
      });
    },
    enabled: !!currentPage?.pageType && !!activePage.id,
  });
};

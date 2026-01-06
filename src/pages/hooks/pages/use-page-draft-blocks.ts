import { useIsPageLoaded } from "@/core/main";
import { ACTIONS } from "@/pages/constants/ACTIONS";
import { useAiContext } from "@/pages/hooks/ai/use-ai-context";
import { useActivePage, useCurrentPage, usePageEditInfo, usePageMetaData } from "@/pages/hooks/pages/use-current-page";
import { useApiUrl } from "@/pages/hooks/project/use-builder-prop";
import { useFetch } from "@/pages/hooks/utils/use-fetch";
import { useSearchParams } from "@/pages/hooks/utils/use-search-params";
import { useQuery } from "@tanstack/react-query";
import { find, get } from "lodash-es";
import { useFallbackLang } from "../use-fallback-lang";
import { useDynamicPageSlug } from "./use-dynamic-page-selector";

export const usePageDraftBlocks = () => {
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page");
  const apiUrl = useApiUrl();
  const { setAiContext } = useAiContext();
  const [, setPageEditInfo] = usePageEditInfo();
  const [, setPageMetaData] = usePageMetaData();
  const [, setPageLoaded] = useIsPageLoaded();
  const fetchAPI = useFetch();
  return useQuery({
    queryKey: [ACTIONS.GET_DRAFT_PAGE, page],
    staleTime: Infinity,
    gcTime: 0,
    queryFn: async () => {
      setPageLoaded(false);
      const data: any = await fetchAPI(apiUrl, {
        action: ACTIONS.GET_DRAFT_PAGE,
        data: { id: page, draft: true },
      });
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
  const { data: currentPage } = useCurrentPage();
  const { data: activePage } = useActivePage();
  const apiUrl = useApiUrl();
  const fetchAPI = useFetch();
  const fallbackLang = useFallbackLang();
  const dynamicPageSlug = useDynamicPageSlug();

  return useQuery({
    queryKey: [ACTIONS.GET_BUILDER_PAGE_DATA, activePage?.id, dynamicPageSlug],
    staleTime: Infinity,
    gcTime: 0,
    queryFn: async () => {
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

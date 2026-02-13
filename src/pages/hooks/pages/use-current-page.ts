import { usePagesProp } from "@/pages/hooks/project/use-builder-prop";
import { useSearchParams } from "@/pages/hooks/utils/use-search-params";
import { atom, useAtom } from "jotai";
import { find, noop } from "lodash-es";
import { useMemo } from "react";
import { useDynamicPageSlug } from "./use-dynamic-page-selector";
import { useWebsitePages } from "./use-project-pages";

const pageEditInfoAtom = atom<{
  lastSaved?: string;
}>({ lastSaved: undefined });

export const usePageEditInfo = () => {
  return useAtom(pageEditInfoAtom);
};

export const useChaiCurrentPage = () => {
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page");
  const { data: pages, isFetching } = useWebsitePages();
  const currentPage = useMemo(() => ({ ...(find(pages, { id: page }) || {}) }), [pages, page]);
  return { data: currentPage as any, isFetching };
};

export const useActivePage = () => {
  const [searchParams] = useSearchParams();
  const lang = searchParams.get("lang") ?? "";
  const { data: languagePages, isFetching } = useWebsitePages();
  const currentPage = useMemo(() => find(languagePages, { lang }) || {}, [languagePages, lang]);
  return { data: currentPage as any, isFetching };
};

const pageMetaDataAtom = atom<Record<string, any>>({});
export const usePageMetaData = () => {
  return useAtom(pageMetaDataAtom);
};

/**
 *
 * @returns full url of the current page
 */
export const useGetPageFullSlug = () => {
  const { data: activePage } = useActivePage();
  const dynamicPageSlug = useDynamicPageSlug();
  const getLiveUrl = usePagesProp("getLiveUrl", noop);

  const slug = activePage?.slug;
  const fullUrl = getLiveUrl(slug || "/");

  if (dynamicPageSlug) return fullUrl + dynamicPageSlug;
  return fullUrl;
};

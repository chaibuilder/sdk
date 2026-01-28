import { useLanguages } from "@/hooks/use-languages";
import { addNewLangAtom } from "@/pages/atom/add-new-lang";
import { useWebsiteLanguagePages, useWebsitePages } from "@/pages/hooks/pages/use-project-pages";
import { usePageTypes } from "@/pages/hooks/project/use-page-types";
import { useFallbackLang } from "@/pages/hooks/use-fallback-lang";
import { usePageExpandManager } from "@/pages/hooks/utils/use-page-expand-manager";
import { useSearchParams } from "@/pages/hooks/utils/use-search-params";
import { navigateToPage } from "@/pages/utils/navigation";
import { organizePages } from "@/pages/utils/page-organization";
import { useSetAtom } from "jotai";
import { filter, find, isEmpty, map } from "lodash-es";
import { File } from "lucide-react";
import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import RenderPageItems from "./render-page-items";
const PageManagerSearchAndFilter = lazy(() => import("./page-manager-search-and-filter"));

// * Action Modals
const AddNewPage = lazy(() => import("../add-new-page"));
const DeletePage = lazy(() => import("../delete-page"));
const DuplicatePage = lazy(() => import("../duplicate-page"));
const MarkAsTemplate = lazy(() => import("../mark-as-template"));
const UnmarkAsTemplate = lazy(() => import("../unmark-as-template"));
const UnpublishPage = lazy(() => import("../unpublish-page"));

interface PageManagerNewProps {
  close: () => void;
}

const PagesManagerNew = ({ close }: PageManagerNewProps) => {
  const { t } = useTranslation();
  const { languages, setSelectedLang } = useLanguages();
  const { data: pageTypes } = usePageTypes();
  const { data, isFetching } = useWebsitePages();
  const [queryParams, setQueryParams] = useSearchParams();
  const { updateForSelectedPage, expandPagesOnSearch } = usePageExpandManager(null);
  const fallbackLang = useFallbackLang();
  const currentPage = queryParams.get("page");

  // * Page manager
  const [search, setSearch] = useState("");
  const [deletePage, setDeletePage] = useState(null);
  const [addEditPage, setAddEditPage] = useState(null);
  const [unpublishPage, setUnpublishPage] = useState(null);
  const [markAsTemplate, setMarkAsTemplate] = useState(null);
  const [selectedPageType, setSelectedPageType] = useState("");
  const [duplicatePage, setDuplicatePage] = useState<any>(null);
  const [unmarkAsTemplate, setUnmarkAsTemplate] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(fallbackLang);
  const [_showUntranslatedPages, setShowUntranslatedPages] = useState(false);
  const setAddNewLang = useSetAtom(addNewLangAtom);
  const showUntranslatedPages = _showUntranslatedPages && selectedLanguage !== fallbackLang;

  const { data: languagePages, isFetching: isFetchingLangPages } = useWebsiteLanguagePages(selectedLanguage);

  const hasSlug = useCallback(
    (pageType: string) => {
      return find(pageTypes, { key: pageType })?.hasSlug;
    },
    [pageTypes],
  );

  const pages: any[] = useMemo(() => {
    if (!data) return [];
    if (showUntranslatedPages) return filter(data, (page) => !languagePages?.[page.id]);
    return organizePages(data, search, selectedPageType, hasSlug);
  }, [data, hasSlug, search, selectedPageType, languagePages, showUntranslatedPages]);

  useEffect(() => {
    setSelectedLang(fallbackLang);
  }, [fallbackLang, setSelectedLang]);

  /**
   * Validate selectedLanguage against available languages
   */
  useEffect(() => {
    const langParam = queryParams.get("lang");
    if (langParam) {
      const validLanguages = [fallbackLang, ...languages];
      const isValidLang = validLanguages.includes(langParam);
      if (isValidLang && selectedLanguage !== langParam) {
        setSelectedLanguage(langParam);
      } else if (!isValidLang && selectedLanguage !== fallbackLang) {
        setSelectedLanguage(fallbackLang);
      }
    }
  }, [queryParams, languages, fallbackLang, selectedLanguage]);

  /**
   * Handles selected page type
   */
  useEffect(() => {
    if (!isEmpty(selectedPageType)) return;

    const pageType = sessionStorage.getItem("pageTypeFilter") || "all";
    if (!isEmpty(pageTypes) && pageType) {
      if (find(pageTypes, { key: pageType })) {
        setSelectedPageType(pageType as string);
      } else {
        setSelectedPageType("all");
      }
    }
  }, [pageTypes, selectedPageType]);

  /**
   * Handles change page action
   */
  useEffect(() => {
    if (currentPage && !isFetching) {
      const page = find(data, { id: currentPage });
      if (!page) {
        const homePage = find(data, { slug: "/" });
        if (homePage) {
          const newParams = new URLSearchParams({ page: homePage.id });
          navigateToPage(newParams, setQueryParams);
        } else {
          navigateToPage(new URLSearchParams({}), setQueryParams, true);
        }
      }
    }
  }, [data, currentPage, isFetching, setQueryParams]);

  /**
   * Separate useEffect to expand parent pages after pages are computed
   */
  useEffect(() => {
    if (currentPage && !isFetching && !isEmpty(pages)) {
      updateForSelectedPage(pages, currentPage);
    }
  }, [currentPage, isFetching, pages, updateForSelectedPage]);

  useEffect(() => {
    if (!isEmpty(search) && !isEmpty(pages)) {
      expandPagesOnSearch(pages);
    }
  }, [search, pages, expandPagesOnSearch]);

  /**
   * Handles change page action
   * @param page page to change
   */
  const { setSelectedLang: setActiveLanguage } = useLanguages();
  const changePage = useCallback(
    (page: string) => {
      const newParams = new URLSearchParams({ page });
      if (selectedLanguage !== fallbackLang) {
        newParams.set("lang", selectedLanguage);
        setActiveLanguage(selectedLanguage);
      } else {
        setActiveLanguage("");
      }
      navigateToPage(newParams, setQueryParams);
      close();
    },
    [close, setQueryParams, setActiveLanguage, selectedLanguage, fallbackLang],
  );

  /**
   * Handles click action for page manager
   * @param action action to perform
   * @param arg argument for action
   */
  const handleClickAction = (action: string, arg: any) => {
    if (!arg) return;
    switch (action) {
      case "add":
        setAddEditPage(arg);
        break;
      case "select":
        changePage(arg);
        break;
      case "edit":
        if (selectedLanguage !== fallbackLang) {
          setAddNewLang({
            edit: true,
            id: arg?.id,
            primaryPage: arg?.primaryPage,
          });
        } else {
          setAddEditPage(arg);
        }
        break;
      case "delete":
        setDeletePage(arg);
        break;
      case "unpublish":
        setUnpublishPage(arg);
        break;
      case "markAsTemplate":
        setMarkAsTemplate(arg);
        break;
      case "unmarkAsTemplate":
        setUnmarkAsTemplate(arg);
        break;
      case "duplicate":
        setDuplicatePage(arg);
        break;
      case "addLanguagePage":
        setAddNewLang({
          edit: false,
          primaryPage: arg?.page?.id || "",
          preselectedLang: arg?.language || selectedLanguage,
        });
        break;
    }
  };

  return (
    <>
      <div className="flex h-full flex-col justify-between">
        <Suspense>
          <PageManagerSearchAndFilter
            pages={pages}
            search={search}
            setSearch={setSearch}
            languages={[fallbackLang, ...languages]}
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
            selectedPageType={selectedPageType}
            setSelectedPageType={setSelectedPageType}
            onAddPage={(arg) => handleClickAction("add", arg)}
            showUntranslatedPages={showUntranslatedPages}
            setShowUntranslatedPages={setShowUntranslatedPages}
          />
        </Suspense>
        <div className="flex-1 overflow-y-auto px-4 pb-6 pt-2">
          {isFetching || isFetchingLangPages ? (
            <div className="space-y-2">
              {map([...Array(15).keys()], (key) => (
                <div key={key} className="h-7 w-full animate-pulse rounded border border-gray-300 bg-gray-200" />
              ))}
            </div>
          ) : isEmpty(pages) ? (
            <div className="flex h-[70vh] flex-col items-center justify-center gap-y-1 text-sm font-medium text-slate-500">
              <File className="h-6 w-6 stroke-[1]" />
              {t("Empty List!")}
              <span className="font-light">{t("Add new page to start")}</span>
            </div>
          ) : (
            <RenderPageItems
              tier={0}
              pages={pages}
              pageTypes={pageTypes}
              currentPage={currentPage || ""}
              onClickAction={handleClickAction}
              languagePages={languagePages as any}
              selectedLanguage={selectedLanguage}
              showUntranslatedPages={showUntranslatedPages}
            />
          )}
        </div>
      </div>

      {addEditPage && (
        <Suspense>
          <AddNewPage
            closePanel={close}
            editPage={changePage}
            addEditPage={addEditPage}
            setAddEditPage={setAddEditPage}
          />
        </Suspense>
      )}

      {deletePage && (
        <Suspense>
          <DeletePage page={deletePage} onClose={() => setDeletePage(null)} />
        </Suspense>
      )}

      {unpublishPage && (
        <Suspense>
          <UnpublishPage page={unpublishPage} onClose={() => setUnpublishPage(null)} />
        </Suspense>
      )}

      {markAsTemplate && (
        <Suspense>
          <MarkAsTemplate page={markAsTemplate} onClose={() => setMarkAsTemplate(null)} />
        </Suspense>
      )}

      {unmarkAsTemplate && (
        <Suspense>
          <UnmarkAsTemplate page={unmarkAsTemplate} onClose={() => setUnmarkAsTemplate(null)} />
        </Suspense>
      )}

      {duplicatePage && (
        <Suspense>
          <DuplicatePage page={duplicatePage} onClose={() => setDuplicatePage(null)} closePanel={close} />
        </Suspense>
      )}
    </>
  );
};

export default PagesManagerNew;

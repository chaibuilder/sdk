import { mergeClasses } from "@/core/main";
import { PageDropdownInHeader } from "@/pages/client/components/page-dropdown-in-header";
import { ScreenOverlay } from "@/pages/client/components/screen-overlay";
import TopbarLeft, { LanguageSwitcher } from "@/pages/client/components/topbar-left";
import TopbarRight from "@/pages/client/components/topbar-right";
import { useCurrentActivePage, useGetPageFullSlug, usePrimaryPage } from "@/pages/hooks/pages/use-current-page";
import { useDynamicPageSelector, useDynamicPageSlug } from "@/pages/hooks/pages/use-dynamic-page-selector";
import { useChaiFeatureFlag } from "@/runtime/client";
import { get } from "lodash-es";
import { ExternalLink } from "lucide-react";
import { lazy, Suspense } from "react";
const DynamicPageSelector = lazy(() => import("../client/components/dynamic-page-selector"));

const DynamicPageSelectorSuspense = () => {
  const { dynamicPage, allLangPages, isFetching: isFetchingDynamicPage } = useDynamicPageSelector();
  const hasDynamicPage = allLangPages.length > 0;

  if (isFetchingDynamicPage) return null;
  return (
    <div className="relative">
      {!dynamicPage && <ScreenOverlay hasDynamicPage={hasDynamicPage} />}
      <Suspense>
        <DynamicPageSelector />
      </Suspense>
    </div>
  );
};

const AddressBar = () => {
  const { data: activePage, isFetching: isFetchingActivePage } = useCurrentActivePage();
  const { data: page, isFetching: isFetchingCurrentPage } = usePrimaryPage();
  const dynamic = get(page, "dynamic", false);
  const dynamicPageSlug = useDynamicPageSlug();
  const isDynamicPageSelectorEnabled = useChaiFeatureFlag("dynamic-page-selector");

  const slug = activePage?.slug;
  const isPartialPage = !slug;
  const fullUrl = useGetPageFullSlug();
  const isFetching = isFetchingActivePage || isFetchingCurrentPage;

  // Ensure the slug is always visible, truncate domain if needed
  const visible = isPartialPage ? `Partial: ${activePage?.name} ` : `${slug}${dynamicPageSlug}`;

  const visibleSlug = visible.replace(window.location.host, "");
  return (
    <div className={`relative flex items-center`}>
      <div
        className={mergeClasses(
          "flex h-8 w-auto max-w-[600px] items-center rounded-l-md border border-r-0 border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800",
          isFetching && "max-w-0 overflow-hidden opacity-0",
        )}>
        <PageDropdownInHeader />
      </div>
      <div
        className={mergeClasses(
          "flex h-8 w-auto max-w-[600px] items-center rounded-r-md border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800" +
            (isPartialPage ? " pr-2" : ""),
          isFetching && "max-w-0 overflow-hidden opacity-0",
        )}>
        <LanguageSwitcher />
        <div className="flex w-full items-center overflow-hidden">
          <div
            className={`w-full max-w-[200px] overflow-hidden overflow-ellipsis whitespace-nowrap pl-1 text-xs ${isPartialPage ? "italic text-gray-400" : "font-mono text-gray-500"}`}>
            {visibleSlug === "/" ? (
              <span className="text-gray-900">
                /<span className="text-[11px] font-light italic text-gray-400">(Homepage)</span>
              </span>
            ) : (
              visibleSlug
            )}
          </div>
          {!isPartialPage && (
            <a href={fullUrl} target="_blank" rel="noopener noreferrer">
              <div className="ml-2 mr-px flex-shrink-0 rounded-sm p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                <ExternalLink className="h-4 w-4" strokeWidth={1} />
              </div>
            </a>
          )}
        </div>
      </div>
      {dynamic && isDynamicPageSelectorEnabled && <DynamicPageSelectorSuspense />}
    </div>
  );
};

export const Topbar = () => {
  return (
    <div className="grid h-full w-full grid-cols-3 items-center px-2">
      <div className="flex justify-start">
        <TopbarLeft />
      </div>
      <div className="flex justify-center">
        <AddressBar />
      </div>
      <div className="flex justify-end">
        <TopbarRight />
      </div>
    </div>
  );
};

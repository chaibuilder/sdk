import { CanvasTopBar } from "@/core/components/canvas/topbar/canvas-top-bar";
import { mergeClasses } from "@/core/main";
import { PageDropdownInHeader } from "@/pages/client/components/page-dropdown-in-header";
import { ScreenOverlay } from "@/pages/client/components/screen-overlay";
import TopbarLeft, { LanguageSwitcher } from "@/pages/client/components/topbar-left";
import TopbarRight from "@/pages/client/components/topbar-right";
import { useCurrentActivePage, useGetPageFullSlug, usePrimaryPage } from "@/pages/hooks/pages/use-current-page";
import { useDynamicPageSelector, useDynamicPageSlug } from "@/pages/hooks/pages/use-dynamic-page-selector";
import { useChaiFeatureFlag } from "@/runtime/client";
import { get } from "lodash-es";
import { ChevronRight, ExternalLink } from "lucide-react";
import { lazy, Suspense } from "react";
import PagesManagerTrigger from "../client/components/page-manager/page-manager-trigger";
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
      <div className="flex items-center">
        {/* PagesManagerTrigger */}
        <div className={mergeClasses("flex h-8 items-center", isFetching && "max-w-0 overflow-hidden opacity-0")}>
          <PagesManagerTrigger />
        </div>

        {/* ChevronRight */}
        <ChevronRight className="mx-1 h-3 w-3 flex-shrink-0 text-gray-400" />

        {/* PageDropdownInHeader */}
        <div className={mergeClasses("flex h-8 items-center", isFetching && "max-w-0 overflow-hidden opacity-0")}>
          <PageDropdownInHeader />
        </div>

        {/* ChevronRight */}
        <ChevronRight className="mx-1 h-3 w-3 flex-shrink-0 text-gray-400" />

        {/* LanguageSwitcher */}
        {/* <div
          className={mergeClasses(
            "flex h-8 items-center" + (isPartialPage ? " pr-2" : ""),
            isFetching && "max-w-0 overflow-hidden opacity-0",
          )}>
          <LanguageSwitcher />
        </div> */}

        {/* ChevronRight */}
        {/* <ChevronRight className="mx-1 h-3 w-3 flex-shrink-0 text-gray-400" /> */}

        {/* Current page path */}
        <div className="group flex items-center overflow-hidden">
          <div
            className={`w-full max-w-[200px] overflow-hidden overflow-ellipsis whitespace-nowrap text-xs ${isPartialPage ? "italic" : "font-mono"}`}>
            {visibleSlug === "/" ? (
              <span>
                /<span className="text-[11px] font-light italic">(Homepage)</span>
              </span>
            ) : (
              visibleSlug
            )}
          </div>
          {!isPartialPage && (
            <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="">
              <div className="ml-2 mr-px flex-shrink-0 rounded-sm p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
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
        <AddressBar />
      </div>
      <div className="flex justify-center">
        <CanvasTopBar />
      </div>
      <div className="flex items-center justify-end">
        <LanguageSwitcher />
        <TopbarRight />
      </div>
    </div>
  );
};

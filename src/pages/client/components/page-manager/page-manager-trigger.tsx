import { useCurrentPage } from "@/pages/hooks/pages/use-current-page";
import { useWebsitePages } from "@/pages/hooks/pages/use-project-pages";
import { useSearchParams } from "@/pages/hooks/utils/use-search-params";
import { navigateToPage } from "@/pages/utils/navigation";
import { ChaiPage } from "@/pages/utils/page-organization";
import { useSavePage, useTranslation } from "@chaibuilder/sdk";
import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@chaibuilder/sdk/ui";
import { isEmpty } from "lodash-es";
import { Folder, LogsIcon } from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { usePageLockStatus } from "../page-lock/page-lock-hook";
const PagesManagerNew = lazy(() => import("./page-manager-new"));

const PagesManagerTrigger = ({ children }: { children?: React.ReactNode }) => {
  const { t } = useTranslation();
  const [searchParams, setQueryParams] = useSearchParams();
  const page = searchParams.get("page");
  const { data: currentPage, isFetching } = useCurrentPage();
  const { data: allPages, isFetching: isPagesLoading } = useWebsitePages();
  const [pageManager, setPageManager] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { savePage } = useSavePage();
  const canClose = !!page && !isEmpty(currentPage);
  const { isLocked } = usePageLockStatus();

  const homepageId = useMemo(() => {
    if (!allPages || isPagesLoading) return false;
    const homepage = allPages.find((pageItem: ChaiPage) => pageItem.slug === "/");
    return homepage?.id;
  }, [allPages, isPagesLoading]);

  useEffect(() => {
    if (isPagesLoading || !homepageId) return;

    const isPageExists = allPages.some((pageItem: ChaiPage) => pageItem.id === page);
    if (isPageExists) return;

    const newParams = new URLSearchParams({ page: homepageId });
    navigateToPage(newParams, setQueryParams);
    if (!isPagesLoading && allPages) setIsInitialLoad(false);
  }, [page, isPagesLoading, allPages, homepageId, setQueryParams]);

  // Open the page manager
  const shouldOpenForMissingPage = !isInitialLoad && !page;
  const shouldOpenForEmptyPage = !isInitialLoad && !isFetching && isEmpty(currentPage);
  const isOpen = pageManager || shouldOpenForMissingPage || shouldOpenForEmptyPage;

  return (
    <>
      <div className="flex items-center gap-x-1">
        <div className="relative">
          <Tooltip>
            <TooltipTrigger
              asChild
              onClick={() => {
                if (!isLocked) savePage();
                setPageManager(true);
              }}>
              {children || (
                <Button variant="outline" key={"template-viewer"} className="flex w-full items-center space-x-2 py-1">
                  <LogsIcon className="h-4 w-4" />
                </Button>
              )}
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{t("Open pages manager")}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <Sheet open={isOpen} onOpenChange={(open) => !open && canClose && setPageManager(false)}>
        <SheetContent
          side={"left"}
          aria-describedby="pages-manager-description"
          className={`z-50 !min-w-[50vh] !max-w-[800px] border-border p-0 ${!canClose ? "sheet-hide-close-btn" : ""}`}>
          <SheetHeader className={`mb-3 px-4 pt-4`}>
            <SheetTitle className="flex items-center gap-2 text-sm font-semibold">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Folder className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{t("Pages")}</span>
                <span id="pages-manager-description" className="text-xs font-normal text-muted-foreground">
                  {t("Manage your site structure")}
                </span>
              </div>
            </SheetTitle>
            <SheetDescription className="sr-only">{t("Manage your site structure")}</SheetDescription>
          </SheetHeader>
          <div className="h-[calc(100vh-80px)] overflow-y-auto">
            {isOpen && (
              <Suspense>
                <PagesManagerNew close={() => setPageManager(false)} />
              </Suspense>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default PagesManagerTrigger;

import { Button } from "@/components/ui/button";
import { ChaiBuilderEditor } from "@/core/main";
import { Topbar } from "@/pages/extensions/topbar";
import { useAskAi } from "@/pages/hooks/ai/use-ask-ai";
import { useChaiCurrentPage } from "@/pages/hooks/pages/use-current-page";
import { useExtractPageBlocks } from "@/pages/hooks/pages/use-extract-page-blocks";
import { usePageAllData } from "@/pages/hooks/pages/use-page-all-data";
import { useUpdateWebsiteFields } from "@/pages/hooks/project/mutations";
import { useSearchPageTypePages } from "@/pages/hooks/project/use-page-types";
import { useCheckUserAccess } from "@/pages/hooks/user/use-check-access";
import { usePagesSavePage } from "@/pages/hooks/utils/use-chai-api";
import { usePagesProps } from "@/pages/hooks/utils/use-pages-props";
import { usePartialBlocksFn } from "@/pages/hooks/utils/use-partial-blocks";
import { useSearchParams } from "@/pages/hooks/utils/use-search-params";
import { registerChaiPanels } from "@/pages/panels";
import { registerChaiMediaManager } from "@/runtime/client/register-chai-media-manager";
import { registerChaiSaveToLibrary } from "@/runtime/client/register-chai-save-to-library";
import { registerChaiTopBar } from "@/runtime/client/register-chai-top-bar";
import { ChaiWebsiteBuilderProps } from "@/types/common";
import { loadWebBlocks } from "@/web-blocks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useAtom } from "jotai";
import { cloneDeep, get, pick } from "lodash-es";
import { Loader } from "lucide-react";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { previewUrlAtom } from "./atom/preview-url";
import { BlurContainer } from "./client/components/chai-loader";
import { usePageLockStatus } from "./client/components/page-lock/page-lock-hook";
import { PAGE_STATUS } from "./client/components/page-lock/page-lock-utils";
import { registerPagesFeatureFlags } from "./feature-flags";
import { useGetBlockAysncProps } from "./hooks/use-chai-collections";
import { useGotoPage } from "./hooks/use-goto-page";
import { useWebsiteData } from "./hooks/use-website-data";

const PageLock = lazy(() => import("./client/components/page-lock/page-lock"));
const NoLanguagePageDialog = lazy(() => import("@/pages/client/components/no-language-page/no-language-page-dialog"));
const DigitalAssetManager = lazy(() => import("@/pages/digital-asset-manager/digital-asset-manager"));
const SaveToLibrary = lazy(() => import("@/pages/client/components/save-ui-blocks/save-to-lib"));
const PreviewWeb = lazy(() => import("./client/components/web-preview"));

registerPagesFeatureFlags();
loadWebBlocks();
registerChaiTopBar(Topbar);
registerChaiPanels();
registerChaiMediaManager(DigitalAssetManager as any);
registerChaiSaveToLibrary(SaveToLibrary);

const DEFAULT_ROLES_AND_PERMISSIONS = {
  role: "",
  permissions: null,
};

/**
 *
 * @returns CHAIBUILDER PAGES COMPONENT
 */
const BuilderWithAccessCheck = (props: ChaiWebsiteBuilderProps) => {
  const { isLoading } = useCheckUserAccess();

  if (isLoading) {
    return (
      <BlurContainer className="fixed inset-0 bg-white">
        <Loader className="h-6 w-6 animate-spin text-primary" />
      </BlurContainer>
    );
  }

  return <DefaultChaiBuilder {...props} />;
};

const DefaultChaiBuilder = (props: ChaiWebsiteBuilderProps) => {
  const { data: websiteData, isFetching: isWebsiteDataFetching, isError } = useWebsiteData();

  // Show loader until websiteData is resolved (cache gets populated first)
  if (!websiteData || isWebsiteDataFetching) {
    return (
      <BlurContainer className="fixed inset-0 bg-white">
        <Loader className="h-6 w-6 animate-spin text-primary" />
      </BlurContainer>
    );
  }
  if (isError) {
    return (
      <BlurContainer className="fixed inset-0 bg-white">
        <p>Failed to load website data</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </BlurContainer>
    );
  }

  // Once resolved, render the editor — all child hooks will find data in cache
  return <ChaiBuilderInner {...props} websiteData={websiteData} />;
};

type ChaiBuilderInnerProps = ChaiWebsiteBuilderProps & {
  websiteData: any;
};

const ChaiBuilderInner = ({ websiteData, ...props }: ChaiBuilderInnerProps) => {
  const { libraries: uiLibraries, collections, pageTypes, websiteSettings: websiteConfig, siteWideUsage } = websiteData;
  const fallbackLang = useMemo(() => websiteConfig?.fallbackLang || "en", [websiteConfig]);
  const { data: accessData, isFetching: isFetchingAccessData } = useCheckUserAccess();
  const roleAndPermissions = accessData || DEFAULT_ROLES_AND_PERMISSIONS;
  // * PAGE DATA
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page");
  const { data: currentPage } = useChaiCurrentPage();
  const { data: pageData, isFetching: isFetchingPageAllData } = usePageAllData();
  const { blocks } = useExtractPageBlocks(pageData?.draftPage?.blocks ?? []);
  const { pageStatus } = usePageLockStatus();

  // * ACTIONS
  const askAiCallBack = useAskAi();
  const { onSave } = usePagesSavePage();
  const { mutateAsync: getBlockAsyncProps } = useGetBlockAysncProps();
  const { getPartialBlocks, getPartialBlockBlocks } = usePartialBlocksFn();
  const { mutateAsync: searchPageTypePages } = useSearchPageTypePages();
  const { mutateAsync: updateSettings } = useUpdateWebsiteFields();
  const gotoPage = useGotoPage();

  // * STATES
  const [tabHidden, setTabHidden] = useState(false);

  // * UTILS
  const blocksDataRef = useRef([] as any);
  const currentTheme = useMemo(() => get(websiteConfig, "theme", {}) || {}, [websiteConfig]);
  const websiteLanguages = useMemo(() => get(websiteConfig, "languages", []) || [], [websiteConfig]);
  const websiteDesignTokens = useMemo(() => get(websiteConfig, "designTokens", {}) || {}, [websiteConfig]);
  const isEditing = pageStatus === PAGE_STATUS.EDITING;
  const isCheckingPageLock = pageStatus === PAGE_STATUS.CHECKING;
  const isFetchingPageData = isFetchingPageAllData || isCheckingPageLock;

  useEffect(() => {
    blocksDataRef.current = blocks;
  }, [blocks]);

  //Show Preview
  const [previewUrl] = useAtom(previewUrlAtom);

  // * EFFECTS to control tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabHidden(true);
      } else {
        setTabHidden(false);
      }
    };
    window.addEventListener("visibilitychange", handleVisibilityChange);
    return () => window.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // * FORWARD PROPS
  const forwardedProps = useMemo(() => {
    const editorProps: any = {};
    if (roleAndPermissions) {
      editorProps.permissions = get(roleAndPermissions, "permissions", null);
      editorProps.role = get(roleAndPermissions, "role", "user");
    }
    editorProps.pageExternalData = pageData?.builderPageData ?? {};
    return editorProps;
  }, [roleAndPermissions, pageData]);

  const isLibrarySite = useMemo(() => {
    return uiLibraries?.some((library: any) => library.isSiteLibrary);
  }, [uiLibraries]);

  // * SEARCH for page types
  const searchPageTypeItems = useCallback(
    async (pageType: string, query: string) => {
      return await searchPageTypePages({ pageType, query });
    },
    [searchPageTypePages],
  );

  return (
    <>
      {isFetchingPageAllData && (
        <BlurContainer className={isFetchingAccessData ? "fixed inset-0 bg-white" : "bg-white/75"}>
          <Loader className={`animate-spin text-primary ${isFetchingAccessData ? "h-6 w-6" : "h-5 w-5"}`} />
        </BlurContainer>
      )}
      {previewUrl && (
        <Suspense
          fallback={
            <div className="absolute inset-0 z-[999999] flex min-h-screen w-screen items-center justify-center bg-gray-100">
              <Loader className="h-6 w-6 animate-spin text-primary" />
            </div>
          }>
          <PreviewWeb />
        </Suspense>
      )}
      <ChaiBuilderEditor
        siteWideUsage={siteWideUsage ?? {}}
        flags={props.flags ? { ...props.flags, librarySite: isLibrarySite } : { librarySite: isLibrarySite }}
        gotoPage={gotoPage}
        collections={collections ?? []}
        getBlockAsyncProps={getBlockAsyncProps}
        themePresets={props.themePresets ?? []}
        pageId={currentPage?.id}
        loading={isFetchingPageData}
        fallbackLang={fallbackLang}
        languages={websiteLanguages}
        brandingOptions={currentTheme}
        designTokens={websiteDesignTokens}
        translations={props.translations || {}}
        locale={props.locale || "en"}
        htmlDir={props.htmlDir || "ltr"}
        autoSave={!tabHidden && isEditing && (props.autoSave ?? true)}
        autoSaveActionsCount={props.autoSaveActionsCount ?? 10}
        onError={props.onError || console.error}
        getPartialBlockBlocks={getPartialBlockBlocks}
        getPartialBlocks={getPartialBlocks}
        blocks={isFetchingPageAllData ? [] : blocks}
        theme={cloneDeep(currentTheme)}
        pageTypes={pageTypes}
        searchPageTypeItems={searchPageTypeItems}
        askAiCallBack={askAiCallBack}
        onSave={async ({ blocks: _blocks, needTranslations }) => {
          if (!page) return true;
          blocksDataRef.current = _blocks;
          const updatedBlocks = [..._blocks];
          await onSave({ page: page as string, blocks: updatedBlocks, needTranslations });
          blocksDataRef.current = updatedBlocks;
          return true;
        }}
        onSaveWebsiteData={async ({ type, data }) => {
          if (type === "THEME") {
            await updateSettings({ settings: { theme: data } });
          } else if (type === "DESIGN_TOKENS") {
            await updateSettings({ settings: { designTokens: data } });
          }
          return true;
        }}
        {...forwardedProps}>
        <PageLock isFetchingPageData={isFetchingPageAllData} />
      </ChaiBuilderEditor>
      <div>
        <NoLanguagePageDialog />
      </div>
    </>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    },
  },
});

const ChaiWebsiteBuilder = (props: ChaiWebsiteBuilderProps) => {
  const [, setPagesProps] = usePagesProps();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setPagesProps(
      pick(props, [
        "apiUrl",
        "usersApiUrl",
        "assetsApiUrl",
        "getPreviewUrl",
        "getLiveUrl",
        "topLeftCorner",
        "onLogout",
        "getAccessToken",
        "websocket",
        "realtimeAdapter",
        "getLoggedInUser",
        "flags",
        "currentUser",
      ]),
    );
    setTimeout(() => {
      setReady(true);
    }, 200);

    return () => {
      setReady(false);
      setPagesProps({});
    };
  }, [props, setPagesProps]);

  if (!ready) {
    return <div></div>;
  }

  // if not, create a new query client and wrap the builder with it
  // else rely on the parent app to provide the query client
  if (get(props, "hasReactQueryProvider", false) === true)
    return (
      <>
        <BuilderWithAccessCheck {...props} />
        <ReactQueryDevtools />
      </>
    );

  return (
    <QueryClientProvider client={queryClient}>
      <BuilderWithAccessCheck {...props} />
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};

export { ChaiWebsiteBuilder };

import { ChaiBuilderEditor } from "@/core/main";
import { Topbar } from "@/pages/extensions/topbar";
import { useAskAi } from "@/pages/hooks/ai/use-ask-ai";
import { useChaiCurrentPage } from "@/pages/hooks/pages/use-current-page";
import { useExtractPageBlocks } from "@/pages/hooks/pages/use-extract-page-blocks";
import { useBuilderPageData, usePageDraftBlocks } from "@/pages/hooks/pages/use-page-draft-blocks";
import { useUpdateWebsiteFields } from "@/pages/hooks/project/mutations";
import { usePageTypes, useSearchPageTypePages } from "@/pages/hooks/project/use-page-types";
import { useUILibraries } from "@/pages/hooks/project/use-ui-libraries";
import { useWebsiteSetting } from "@/pages/hooks/project/use-website-settings";
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
import { useChaiCollections, useGetBlockAysncProps } from "./hooks/use-chai-collections";
import { useFallbackLang } from "./hooks/use-fallback-lang";
import { useGotoPage } from "./hooks/use-goto-page";
import { useSiteWideUsage } from "./hooks/use-site-wide-usage";

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
  const { isLoading, data: accessData } = useCheckUserAccess();

  if (isLoading) {
    return (
      <BlurContainer className="fixed inset-0 bg-white">
        <Loader className="h-6 w-6 animate-spin text-primary" />
      </BlurContainer>
    );
  }

  return <DefaultChaiBuilder {...props} roleAndPermissions={accessData} />;
};

const DefaultChaiBuilder = (
  props: ChaiWebsiteBuilderProps & {
    roleAndPermissions?: { access: boolean; role: string; permissions: string[] | null };
  },
) => {
  // * WEBSITE DATA
  const { data: uiLibraries } = useUILibraries();
  const fallbackLang = useFallbackLang();
  const roleAndPermissions = props.roleAndPermissions || DEFAULT_ROLES_AND_PERMISSIONS;
  const { data: pageTypes, isFetching: isPageTypesFetching } = usePageTypes();
  const { data: collections, isFetching: isCollectionsFetching } = useChaiCollections();
  const { data: websiteConfig, isFetching: isWebsiteConfigFetching } = useWebsiteSetting();
  const isFetchingWebsiteData = isPageTypesFetching || isCollectionsFetching || isWebsiteConfigFetching;

  // * PAGE DATA
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page");
  const { data: currentPage } = useChaiCurrentPage();
  const { data: draftBlocks, isFetching: isDraftBlocksFetching } = usePageDraftBlocks();
  const { blocks } = useExtractPageBlocks(draftBlocks);
  const { data: builderPageData, isFetching: isBuilderPageDataFetching } = useBuilderPageData();
  const { pageStatus } = usePageLockStatus();

  // * ACTIONS
  const askAiCallBack = useAskAi();
  const { onSave } = usePagesSavePage();
  const { mutateAsync: getBlockAsyncProps } = useGetBlockAysncProps();
  const { getPartialBlocks, getPartialBlockBlocks } = usePartialBlocksFn();
  const { mutateAsync: searchPageTypePages } = useSearchPageTypePages();
  const { mutateAsync: updateSettings } = useUpdateWebsiteFields();
  const { data: siteWideUsage } = useSiteWideUsage(props.flags?.designTokens ?? true);
  const gotoPage = useGotoPage();

  // * STATES
  const [tabHidden, setTabHidden] = useState(false);

  // * UTILS
  const blocksDataRef = useRef([] as any);
  const currentTheme = useMemo(() => get(websiteConfig, "theme", {}) || {}, [websiteConfig]);
  const isEditing = pageStatus === PAGE_STATUS.EDITING;
  const isCheckingPageLock = pageStatus === PAGE_STATUS.CHECKING;
  const isFetchingPageData = isDraftBlocksFetching || isCheckingPageLock || isBuilderPageDataFetching;

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
    return editorProps;
  }, [roleAndPermissions]);

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
      {isFetchingPageData && (
        <BlurContainer className={isFetchingWebsiteData ? "fixed inset-0 bg-white" : "bg-white/75"}>
          <Loader className={`animate-spin text-primary ${isFetchingWebsiteData ? "h-6 w-6" : "h-5 w-5"}`} />
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
        pageExternalData={builderPageData}
        themePresets={props.themePresets ?? []}
        pageId={currentPage?.id}
        loading={isDraftBlocksFetching}
        fallbackLang={fallbackLang}
        languages={websiteConfig?.languages || []}
        brandingOptions={websiteConfig?.theme || {}}
        designTokens={websiteConfig?.designTokens || {}}
        translations={props.translations || {}}
        locale={props.locale || "en"}
        htmlDir={props.htmlDir || "ltr"}
        autoSave={!tabHidden && isEditing && (props.autoSave ?? true)}
        autoSaveActionsCount={props.autoSaveActionsCount ?? 10}
        onError={props.onError || console.error}
        getPartialBlockBlocks={getPartialBlockBlocks}
        getPartialBlocks={getPartialBlocks}
        blocks={isDraftBlocksFetching ? [] : blocks}
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
        <PageLock isFetchingPageData={isFetchingPageData} />
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

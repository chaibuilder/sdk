import {
  ChaiBuilderEditor,
  ChaiBuilderEditorProps,
  registerChaiMediaManager,
  registerChaiSaveToLibrary,
  registerChaiTopBar,
} from "@/core/main";
import { Topbar } from "@/pages/extensions/topbar";
import { useAskAi } from "@/pages/hooks/ai/use-ask-ai";
import { useChaiCurrentPage } from "@/pages/hooks/pages/use-current-page";
import { useExtractPageBlocks } from "@/pages/hooks/pages/use-extract-page-blocks";
import { useBuilderPageData, usePageDraftBlocks } from "@/pages/hooks/pages/use-page-draft-blocks";
import { useUpdateWebsiteSettings } from "@/pages/hooks/project/mutations";
import { usePageTypes, useSearchPageTypePages } from "@/pages/hooks/project/use-page-types";
import { useUILibraries } from "@/pages/hooks/project/use-ui-libraries";
import { useWebsiteSetting } from "@/pages/hooks/project/use-website-settings";
import { useUserRoleAndPermissions } from "@/pages/hooks/user/use-user-permissions";
import { usePagesSavePage } from "@/pages/hooks/utils/use-chai-api";
import { usePagesProps } from "@/pages/hooks/utils/use-pages-props";
import { usePartialBlocksFn } from "@/pages/hooks/utils/use-partial-blocks";
import { useSearchParams } from "@/pages/hooks/utils/use-search-params";
import { registerChaiPanels } from "@/pages/panels";
import { LoggedInUser } from "@/pages/types/loggedin-user.ts";
import { loadWebBlocks } from "@/web-blocks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useAtom } from "jotai";
import { cloneDeep, get, isEmpty, isEqual, pick } from "lodash-es";
import { Loader } from "lucide-react";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { previewUrlAtom } from "./atom/preview-url.ts";
import { BlurContainer } from "./client/components/chai-loader.tsx";
import { usePageLockStatus } from "./client/components/page-lock/page-lock-hook.ts";
import { PAGE_STATUS } from "./client/components/page-lock/page-lock-utils.ts";
import { registerPagesFeatureFlags } from "./feature-flags";
import { useChaiCollections, useGetBlockAysncProps } from "./hooks/use-chai-collections.ts";
import { useFallbackLang } from "./hooks/use-fallback-lang.ts";
import { useGotoPage } from "./hooks/use-goto-page.ts";
import { useSiteWideUsage } from "./hooks/use-site-wide-usage.ts";

const PageLock = lazy(() => import("./client/components/page-lock/page-lock.tsx"));
const NoLanguagePageDialog = lazy(
  () => import("@/pages/client/components/no-language-page/no-language-page-dialog.tsx"),
);
const DigitalAssetManager = lazy(() => import("@/pages/digital-asset-manager/digital-asset-manager.tsx"));
const SaveToLibrary = lazy(() => import("@/pages/client/components/save-ui-blocks/save-to-lib"));
const ThemePanelFooter = lazy(() => import("@/pages/client/components/theme-panel-footer"));
const PreviewWeb = lazy(() => import("./client/components/web-preview.tsx"));

registerPagesFeatureFlags();
loadWebBlocks();
registerChaiTopBar(Topbar);
registerChaiPanels();
registerChaiMediaManager(DigitalAssetManager as any);
registerChaiSaveToLibrary(SaveToLibrary);

export type ChaiBuilderPagesProps = {
  hasReactQueryProvider?: boolean;
  topLeftCorner?: React.FC;
  apiUrl?: string;
  usersApiUrl?: string;
  assetsApiUrl?: string;
  getPreviewUrl?: (slug: string) => string;
  getLiveUrl?: (slug: string) => string;
  onLogout?: () => void;
  getAccessToken?: () => Promise<string>;
  currentUser: LoggedInUser | null;
  websocket?: any;
  features?: { sharedJsonLD?: boolean; canResetSeoToDefault?: boolean } & Record<string, boolean>;
} & Pick<
  ChaiBuilderEditorProps,
  | "onError"
  | "translations"
  | "locale"
  | "htmlDir"
  | "autoSave"
  | "autoSaveActionsCount"
  | "fallbackLang"
  | "languages"
  | "themePresets"
  | "flags"
  | "structureRules"
>;

const DEFAULT_ROLES_AND_PERMISSIONS = {
  role: "",
  permissions: null,
};

/**
 *
 * @returns CHAIBUILDER PAGES COMPONENT
 */
const DefaultChaiBuilder = (props: ChaiBuilderPagesProps) => {
  // * WEBSITE DATA
  const { data: uiLibraries } = useUILibraries();
  const fallbackLang = useFallbackLang();
  const { data: roleAndPermissions = DEFAULT_ROLES_AND_PERMISSIONS, isFetching: isRoleAndPermissionsFetching } =
    useUserRoleAndPermissions();
  const { data: pageTypes, isFetching: isPageTypesFetching } = usePageTypes();
  const { data: collections, isFetching: isCollectionsFetching } = useChaiCollections();
  const { data: websiteConfig, isFetching: isWebsiteConfigFetching } = useWebsiteSetting();
  const isFetchingWebsiteData =
    isRoleAndPermissionsFetching || isPageTypesFetching || isCollectionsFetching || isWebsiteConfigFetching;

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
  const { mutateAsync: updateSettings } = useUpdateWebsiteSettings();
  const { data: siteWideUsage } = useSiteWideUsage(props.flags?.designTokens ?? false);
  const gotoPage = useGotoPage();

  // * STATES
  const [tabHidden, setTabHidden] = useState(false);

  // * UTILS
  const blocksDataRef = useRef([] as any);
  const currentTheme = useMemo(() => get(websiteConfig, "theme", {}) || {}, [websiteConfig]);
  const isEditing = pageStatus === PAGE_STATUS.EDITING;
  const isCheckingPageLock = pageStatus === PAGE_STATUS.CHECKING;
  const isFetchingPageData = isDraftBlocksFetching || isCheckingPageLock || isBuilderPageDataFetching;

  blocksDataRef.current = blocks;

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
        onSave={async ({ blocks: _blocks, theme, needTranslations, designTokens }) => {
          if (!page) return true;
          blocksDataRef.current = _blocks;
          const updatedBlocks = [..._blocks];
          await onSave({ page: page as string, blocks: updatedBlocks, needTranslations });
          blocksDataRef.current = updatedBlocks;
          const settings: { theme?: any; designTokens?: any } = {};
          if (!isEqual(theme, currentTheme)) {
            settings.theme = theme;
          }
          if (!isEqual(designTokens, websiteConfig?.designTokens)) {
            settings.designTokens = designTokens;
          }
          if (isEmpty(settings)) return true;
          await updateSettings({ settings });
          return true;
        }}
        themePanelComponent={ThemePanelFooter}
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

const ChaiBuilderPages = (props: ChaiBuilderPagesProps) => {
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
        "getLoggedInUser",
        "features",
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
        <DefaultChaiBuilder {...props} />
        <ReactQueryDevtools />
      </>
    );

  return (
    <QueryClientProvider client={queryClient}>
      <DefaultChaiBuilder {...props} />
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};

export default ChaiBuilderPages;

import "@/index.css";
import ChaiBuilderPages from "@/pages/chaibuilder-pages";
import { useActivePage } from "@/pages/hooks/pages/use-current-page";
import { NestedPathSelector } from "./client/components/nested-path-selector/nested-path-selector.tsx";
import { useBuilderPageData } from "./hooks/pages/use-page-draft-blocks";
import { usePageTypes } from "./hooks/project/use-page-types";
import { useFallbackLang } from "./hooks/use-fallback-lang";
import { useGotoPage } from "./hooks/use-goto-page";
import { useClearAll, useReloadPage } from "./hooks/use-reload-page";
import { useUpdateActivePageMetadata } from "./hooks/use-update-metadata";

if (typeof window === "undefined") {
  throw new Error("@chaibuilder/pages is not available on the server");
}

export default ChaiBuilderPages;

export { PermissionChecker } from "@/pages/client/components/permission-checker";
export { LanguageSwitcher } from "@/pages/client/components/topbar-left";
export { ImagePicker } from "@/pages/digital-asset-manager/image-picker";
export { SmartJsonInput as ChaiJsonInput } from "./client/components/smart-json-input.tsx";
export { NestedPathSelector };

/** Hooks */
export * from "@/core/main";
export { useCurrentPage as useChaiCurrentPage } from "@/pages/hooks/pages/use-current-page";
export { useLanguagePages } from "@/pages/hooks/pages/use-language-pages";
export { useWebsitePages } from "@/pages/hooks/pages/use-project-pages";
export { useApiUrl } from "@/pages/hooks/project/use-builder-prop";
export { useWebsiteSetting } from "@/pages/hooks/project/use-website-settings";
export { useChaiAuth } from "@/pages/hooks/use-chai-auth";
export { useUserRoleAndPermissions as useUserPermissions } from "@/pages/hooks/user/use-user-permissions";
export { useChaiUserInfo } from "@/pages/hooks/utils/use-chai-user-info.ts";
export { useBuilderFetch, useFetch } from "@/pages/hooks/utils/use-fetch";
export {
  useActivePage,
  useBuilderPageData,
  useClearAll,
  useFallbackLang,
  useGotoPage,
  usePageTypes,
  useReloadPage,
  useUpdateActivePageMetadata,
};

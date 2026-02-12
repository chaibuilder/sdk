import { useGetPageChanges } from "@/pages/hooks/pages/use-get-page-changes";
import { useMemo } from "react";

type PageChange = {
  id: string;
  slug: string;
  name: string;
  pageType: string | null;
  lang: string;
  changes: string[] | null;
  primaryPage: string | null;
  online: boolean | null;
};

export const useUnpublishedWebsiteSettings = () => {
  const { data: changes, isLoading } = useGetPageChanges();

  const hasUnpublishedTheme = useMemo(() => {
    if (!changes || !Array.isArray(changes)) return false;
    return changes.some((change: PageChange) => change.id === "THEME");
  }, [changes]);

  const hasUnpublishedDesignToken = useMemo(() => {
    if (!changes || !Array.isArray(changes)) return false;
    return changes.some((change: PageChange) => change.id === "DESIGN_TOKENS");
  }, [changes]);

  const hasUnpublishedSettings = hasUnpublishedTheme || hasUnpublishedDesignToken;

  return {
    hasUnpublishedSettings,
    hasUnpublishedTheme,
    hasUnpublishedDesignToken,
    isLoading,
  };
};

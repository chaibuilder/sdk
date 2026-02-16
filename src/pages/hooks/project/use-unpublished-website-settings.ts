import { useMemo } from "react";
import { useWebsiteSetting } from "./use-website-settings";

export const useUnpublishedWebsiteSettings = () => {
  const { data, isLoading } = useWebsiteSetting();
  const changes = data?.appChanges;

  const hasUnpublishedTheme = useMemo(() => {
    if (!changes || !Array.isArray(changes)) return false;
    return changes.some((change: string) => change === "THEME");
  }, [changes]);

  const hasUnpublishedDesignToken = useMemo(() => {
    if (!changes || !Array.isArray(changes)) return false;
    return changes.some((change: string) => change === "DESIGN_TOKENS");
  }, [changes]);

  const hasUnpublishedSettings = hasUnpublishedTheme || hasUnpublishedDesignToken;

  return {
    hasUnpublishedSettings,
    hasUnpublishedTheme,
    hasUnpublishedDesignToken,
    isLoading,
  };
};

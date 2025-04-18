import { getChaiThemeCssVariables } from "@/render";
import { ChaiBuilderThemeValues } from "@/types/types";
import { useMemo } from "react";

export const CssThemeVariables = ({ theme }: { theme: ChaiBuilderThemeValues }) => {
  const themeVariables = useMemo(() => {
    return getChaiThemeCssVariables(theme);
  }, [theme]);
  return <style id="chai-theme">{themeVariables}</style>;
};

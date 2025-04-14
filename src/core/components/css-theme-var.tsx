import { get } from "lodash-es";
import { useMemo } from "react";
import { getChaiThemeCssVariables } from "../../render";
import { ChaiBuilderThemeValues } from "../../types/types";
import { useTheme } from "../hooks";
import { hexToHSL } from "./canvas/static/chai-theme-helpers";

export const CssThemeVariables = () => {
  const [chaiTheme] = useTheme();
  const themeVariables = useMemo(() => {
    const theme = getChaiThemeCssVariables(chaiTheme as Partial<ChaiBuilderThemeValues>);
    return theme;
  }, [chaiTheme]);
  return <style id="chai-theme">{themeVariables}</style>;
};

export const PrimaryColorCSSVariable = () => {
  const [chaiTheme] = useTheme();
  const primaryColors = get(chaiTheme, "colors.primary", ["#2563EB", "#3B82F6"]);
  const primaryForegroundColors = get(chaiTheme, "colors.primary-foreground", ["#ffffff", "#ffffff"]);
  return (
    <style id="chai-theme">
      {`:root { 
        --primary: ${hexToHSL(primaryColors[0])}; 
        --primary-foreground: ${hexToHSL(primaryForegroundColors[0])}; 

        .dark {
        --primary: ${hexToHSL(primaryColors[1])}; 
        --primary-foreground: ${hexToHSL(primaryForegroundColors[1])}; 
        }
    }`}
    </style>
  );
};

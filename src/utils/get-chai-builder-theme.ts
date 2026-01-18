import { getChaiThemeOptions } from "@/core/components/canvas/static/chai-theme-helpers";
import { defaultThemeOptions } from "@/core/hooks/default-theme-options";
import { ChaiBuilderThemeOptions } from "@/types/chaibuilder-editor-props";

export const getChaiBuilderTheme = (themeOptions: ChaiBuilderThemeOptions = defaultThemeOptions) => {
  return {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1400px" },
    },
    ...getChaiThemeOptions(themeOptions),
  };
};

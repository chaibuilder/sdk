import { getChaiThemeOptions } from "@/core/components/canvas/static/chai-theme-helpers";
import { defaultThemeOptions } from "@/core/hooks/default-theme-options";
import { ChaiBuilderThemeOptions } from "@/types/chaibuilder-editor-props";

/**
 * Returns Chai Builder theme options - maintained for backward compatibility
 * In Tailwind v4, theme configuration has moved to CSS files using @config syntax
 * 
 * See src/index.css for the current configuration implementation.
 */
export const getChaiBuilderTheme = (themeOptions: ChaiBuilderThemeOptions = defaultThemeOptions) => {
  console.warn(
    "[Deprecated] getChaiBuilderTheme() is deprecated in Tailwind v4. "
    + "Theme configuration is now defined in CSS using @config. "
    + "See src/index.css for the current implementation."
  );
  
  return {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1400px" },
    },
    ...getChaiThemeOptions(themeOptions),
  };
};

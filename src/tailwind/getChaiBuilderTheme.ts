import { getChaiThemeOptions } from "../core/components/canvas/static/ChaiThemeFn";
import { ChaiBuilderThemeOptions } from "../core/types/chaiBuilderEditorProps";

export const getChaiBuilderTheme = (themeOptions: ChaiBuilderThemeOptions) => {
  return {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1400px" },
    },
    ...getChaiThemeOptions(themeOptions),
  };
};

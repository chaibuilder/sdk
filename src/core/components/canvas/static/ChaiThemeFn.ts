import { flatten, isEmpty, keys, uniq } from "lodash-es";
import { ChaiBuilderThemeOptions, ChaiBuilderThemeValues } from "../../../types/chaiBuilderEditorProps.ts";

export const getChaiThemeOptions = (chaiThemeOptions: ChaiBuilderThemeOptions) => {
  const theme = {
    fontFamily: chaiThemeOptions.fontFamily
      ? keys(chaiThemeOptions.fontFamily).reduce(
          (acc, key) => ({
            ...acc,
            [key.replace("font-", "")]: `var(--${key})`,
          }),
          {},
        )
      : {},
    borderRadius: chaiThemeOptions.borderRadius
      ? {
          lg: `var(--radius)`,
          md: `calc(var(--radius) - 2px)`,
          sm: `calc(var(--radius) - 4px)`,
        }
      : {},
    colors: chaiThemeOptions.colors
      ? flatten(chaiThemeOptions.colors.map((color) => Object.entries(color.items))).reduce(
          (acc, [key]) => ({ ...acc, [key]: `hsl(var(--${key}))` }),
          {},
        )
      : {},
  };
  return theme;
};

export const getChaiThemeVariables = (chaiTheme: Partial<ChaiBuilderThemeValues>) => {
  return `:root {
    ${
      chaiTheme.fontFamily &&
      Object.entries(chaiTheme.fontFamily)
        .map(([key, value]) => `--font-${key}: "${value}";`)
        .join("\n    ")
    }
    ${chaiTheme.borderRadius && `--radius: ${chaiTheme.borderRadius};`}
    ${
      chaiTheme.colors &&
      Object.entries(chaiTheme.colors)
        .map(([key, value]) => `--${key}: ${value[0]};`)
        .join("\n    ")
    }
  }
  .dark {
    ${
      chaiTheme.colors &&
      Object.entries(chaiTheme.colors)
        .map(([key, value]) => `--${key}: ${value[1]};`)
        .join("\n    ")
    }
  }`;
};

export const getThemeFonts = (chaiTheme: Pick<Partial<ChaiBuilderThemeValues>, "fontFamily">) => {
  if (isEmpty(chaiTheme.fontFamily)) return "";
  const links = uniq(Object.entries(chaiTheme.fontFamily).map(([, value]) => value));
  return links
    .map((link) => {
      const googleFontUrl = `https://fonts.googleapis.com/css2?family=${link.replace(/\s+/g, "+")}&display=swap`;
      return `<link rel="stylesheet" href="${googleFontUrl}">`;
    })
    .join("\n");
};

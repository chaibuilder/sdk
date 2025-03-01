import { flatten, isEmpty, keys, uniq } from "lodash-es";
import { ChaiBuilderThemeOptions, ChaiBuilderThemeValues } from "../../../types/chaiBuilderEditorProps.ts";
import getPalette from "tailwindcss-palette-generator";

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
          (acc, [key, [value]]) => {
            const temp = {...acc};
            const palette = getPalette(value);
            const result: Record<string, string> = {};

            Object.keys(palette["primary"]).forEach((shade) => {
              result[shade] = `hsl(var(--${key}-${shade}))`;
            });

            temp[key] = result;

            return temp;
          },
          {},
        )
      : {},
  };
  return theme;
};

function hexToHSL(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  let r = parseInt(result[1], 16);
  let g = parseInt(result[2], 16);
  let b = parseInt(result[3], 16);
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  (r /= 255), (g /= 255), (b /= 255);
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h;
  let s;
  const l = (max + min) / 2;
  if (max == min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export const getChaiThemeCssVariables = (chaiTheme: Partial<ChaiBuilderThemeValues>) => {
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
        .map(([key, value]) => {
          const palette = getPalette(value[0]);
          return `--${key}: ${hexToHSL(value[0])};
            ${Object.keys(palette["primary"]).map((shade) =>
              `--${key}-${shade}: ${palette["primary"][shade]}`)}`;
        })
        .join("\n    ")
    }
  }
  .dark {
    ${
      chaiTheme.colors &&
      Object.entries(chaiTheme.colors)
          .map(([key, value]) => {
            const palette = getPalette(value[1]);
            return `--${key}: ${hexToHSL(value[1])};
            ${Object.keys(palette["primary"]).map((shade) =>
                `--${key}-${shade}: ${palette["primary"][shade]}`)}`;
          })
        .join("\n    ")
    }
  }`;
};

export const getThemeFontsLinkMarkup = (chaiTheme: Pick<Partial<ChaiBuilderThemeValues>, "fontFamily">) => {
  if (isEmpty(chaiTheme.fontFamily)) return "";
  const links = uniq(Object.entries(chaiTheme.fontFamily).map(([, value]) => value));
  return links
    .map((link) => {
      const googleFontUrl = `https://fonts.googleapis.com/css2?family=${link.replace(/\s+/g, "+")}&display=swap`;
      return `<link rel="stylesheet" href="${googleFontUrl}">`;
    })
    .join("\n");
};

export const getThemeFontsCSSImport = (chaiTheme: { fontFamily: Record<string, string> }) => {
  if (isEmpty(chaiTheme.fontFamily)) return "";
  const links = uniq(Object.entries(chaiTheme.fontFamily).map(([, value]) => value));
  return links
    .map((link: string) => {
      const googleFontUrl = `https://fonts.googleapis.com/css2?family=${link.replace(/\s+/g, "+")}&display=swap`;
      return `@import url("${googleFontUrl}");`;
    })
    .join("\n");
};

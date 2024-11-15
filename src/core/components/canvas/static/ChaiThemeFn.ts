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

function hexToHSL(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  let r = parseInt(result[1], 16);
  let g = parseInt(result[2], 16);
  let b = parseInt(result[3], 16);
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
        .map(([key, value]) => `--${key}: ${hexToHSL(value[0])};`)
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

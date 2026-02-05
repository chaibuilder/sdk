import { getAllRegisteredFonts, getRegisteredFont } from "@chaibuilder/sdk/runtime";
import { ChaiFont, ChaiFontViaSrc } from "@chaibuilder/sdk/types";
import { compact, filter, has, map, uniqBy } from "lodash";
import { fontsMap, fontUrls } from "./fonts-map-variable";

export const getThemeCustomFontFace = (fonts: string[]) => {
  const fontdefintions = filter(compact(map(fonts, getRegisteredFont)), (font: ChaiFont) => has(font, "src"));
  return getThemeCustomFontFaceStyle(fontdefintions as ChaiFontViaSrc[]);
};

export const getThemeCustomFontFaceStyle = (fonts: ChaiFontViaSrc[]) => {
  if (!fonts || fonts.length === 0) return "";

  return uniqBy(fonts, "family")
    .map((font: ChaiFontViaSrc) =>
      font.src
        .map(
          (source) => `@font-face {
        font-family: "${font.family}";
        src: url("${source.url}") format("${source.format}");
        font-display: swap;
        ${source.fontWeight ? `font-weight: ${source.fontWeight};` : ""}
        ${source.fontStyle ? `font-style: ${source.fontStyle};` : ""}
        ${source.fontStretch ? `font-stretch: ${source.fontStretch};` : ""}
      }`,
        )
        .join("\n"),
    )
    .join("\n");
};

/**
 * Extracts font URLs directly from font family names
 * For variable fonts, we preload the single font file per family
 */
function getFontUrlsForPreload(headingFont: string, bodyFont: string): string[] {
  const fonts = new Set<string>();

  if (fontUrls[headingFont]) {
    fonts.add(fontUrls[headingFont]);
  }

  if (headingFont !== bodyFont && fontUrls[bodyFont]) {
    fonts.add(fontUrls[bodyFont]);
  }

  return Array.from(fonts);
}

export const getFontStyles = async (
  headingFont: string,
  bodyFont: string,
): Promise<{ fontStyles: string; preloads: string[] }> => {
  const registeredFonts = getAllRegisteredFonts();
  let fonts = "";
  if (headingFont !== bodyFont) {
    fonts += fontsMap[bodyFont] ?? "";
  }
  const preloads = getFontUrlsForPreload(headingFont, bodyFont);
  return { fontStyles: fonts, preloads };
};

import { ChaiFont, ChaiFontViaSrc } from "@chaibuilder/sdk/types";
import { compact, filter, has, map, uniqBy } from "lodash";
import { fontsMap } from "./fonts-map";
import { getRegisteredFont } from "@chaibuilder/sdk/runtime";

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

interface FontInfo {
  src: string;
  unicodeRange: string;
  fontFamily: string;
  priority: number;
  estimatedSize: number;
  efficiency: number;
  reason: string;
}

function calculatePriority(unicodeRange: string): number {
  let score = 0;
  const range = unicodeRange.toLowerCase();

  // HIGHEST PRIORITY: Basic Latin + Essential symbols
  if (
    range.includes("u+??") ||
    range.includes("u+20ac") || // Euro symbol
    range.includes("u+feff") || // Byte order mark
    range.includes("u+fffd") || // Replacement character
    range.includes("u+2000-206f") || // General punctuation
    range.includes("u+2122") || // Trademark symbol
    range.includes("u+152-153") || // OE ligatures
    range.includes("u+2212") || // Minus sign
    range.includes("u+2215")
  ) {
    // Division slash
    score += 1000;
  }

  // HIGH PRIORITY: Latin Extended
  if (
    range.includes("u+100-") ||
    range.includes("u+1e00-1e9f") || // Latin Extended Additional
    range.includes("u+1ef2-1eff") || // Vietnamese
    range.includes("u+2c60-2c7f") || // Latin Extended-C
    range.includes("u+a720-a7ff") || // Latin Extended-D
    range.includes("u+20a0-20ab")
  ) {
    // Currency symbols
    score += 800;
  }

  // MEDIUM PRIORITY: Vietnamese specific
  if (range.includes("u+1ea0-1ef9") && range.length < 200) {
    score += 700;
  }

  // LOWER PRIORITY: Specialty scripts
  if (range.includes("u+400-45f") || range.includes("u+460-52f")) score += 200; // Cyrillic
  if (range.includes("u+370-377") || range.includes("u+384-38a")) score += 200; // Greek
  if (range.includes("u+2100-") || range.includes("u+2190-")) score += 150; // Math symbols
  if (range.includes("u+1f??")) score += 50; // Emojis

  return score;
}

/**
 * Estimates font file size based on unicode range coverage
 * Returns estimated size in KB
 */
function estimateFontSize(unicodeRange: string): number {
  const range = unicodeRange.toLowerCase();
  let estimatedSize = 0;

  // Count approximate number of characters covered
  const ranges = unicodeRange.split(",").map((r) => r.trim());

  for (const r of ranges) {
    const rangeMatch = r.match(/u\+([0-9a-f]+)-([0-9a-f]+)/i);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 16);
      const end = parseInt(rangeMatch[2], 16);
      const count = end - start + 1;
      // Rough estimate: ~0.5KB per 10 characters
      estimatedSize += (count * 0.5) / 10;
    } else {
      // Single character or small range
      estimatedSize += 0.05;
    }
  }

  // Special cases for known large ranges
  if (range.includes("u+100-2ba")) estimatedSize = 83; // Large Latin Extended
  if (range.includes("u+??")) estimatedSize = 47; // Basic Latin (comprehensive)
  if (range.includes("u+1ea0-1ef9") && range.length > 100) estimatedSize = 10; // Vietnamese
  if (range.includes("u+400-45f")) estimatedSize = 18; // Cyrillic
  if (range.includes("u+460-52f")) estimatedSize = 25; // Cyrillic Extended
  if (range.includes("u+370-377")) estimatedSize = 19; // Greek
  if (range.includes("u+1f??")) estimatedSize = 11; // Emojis

  return estimatedSize;
}

function getPriorityReason(priority: number): string {
  if (priority >= 1000) return "Basic Latin + Essential Symbols";
  if (priority >= 800) return "Latin Extended (Accented Characters)";
  if (priority >= 700) return "Vietnamese Extensions";
  if (priority >= 200) return "Cyrillic/Greek Characters";
  if (priority >= 150) return "Mathematical Symbols";
  return "Emojis/Pictographs";
}

/**
 * Detects which fonts to preload based on efficiency (priority/size ratio)
 * Prioritizes smaller fonts that cover essential unicode ranges
 */
function detectFontsToPreload(cssText: string): string[] {
  const fontFaces: FontInfo[] = [];
  const fontFaceRegex = /@font-face\s*\{([^}]+)\}/g;

  let match;
  while ((match = fontFaceRegex.exec(cssText)) !== null) {
    const ruleContent = match[1];

    // Extract properties with flexible regex patterns
    const srcMatch = ruleContent.match(/src:\s*url\(["']?([^"')]+)["']?\)/);
    const unicodeRangeMatch = ruleContent.match(/unicode-range:\s*([^;]+);/);
    const fontFamilyMatch = ruleContent.match(/font-family:\s*([^;]+);/);

    if (srcMatch && unicodeRangeMatch && fontFamilyMatch) {
      const unicodeRange = unicodeRangeMatch[1].trim();
      const priority = calculatePriority(unicodeRange);
      const estimatedSize = estimateFontSize(unicodeRange);
      // Calculate efficiency: higher priority with smaller size = better
      const efficiency = priority > 0 ? priority / Math.max(estimatedSize, 1) : 0;

      fontFaces.push({
        src: srcMatch[1],
        unicodeRange,
        fontFamily: fontFamilyMatch[1].trim(),
        priority,
        estimatedSize,
        efficiency,
        reason: getPriorityReason(priority),
      });
    }
  }

  // Strategy: Pick the single most efficient font with best priority/size ratio
  // This ensures we get the most essential characters with minimal file size
  const sortedByEfficiency = fontFaces.sort((a, b) => b.efficiency - a.efficiency);

  // Select only the most efficient Basic Latin font (priority >= 1000)
  const basicLatinFonts = sortedByEfficiency.filter((f) => f.priority >= 1000);
  if (basicLatinFonts.length > 0) {
    return [basicLatinFonts[0].src];
  }

  // Fallback: if no Basic Latin font found, return the most efficient font
  return sortedByEfficiency.length > 0 ? [sortedByEfficiency[0].src] : [];
}

export const getFontStyles = async (
  headingFont: string,
  bodyFont: string,
): Promise<{ fontStyles: string; preloads: string[] }> => {
  let fonts = fontsMap[headingFont] ?? "";
  if (headingFont !== bodyFont) {
    fonts += fontsMap[bodyFont] ?? "";
  }
  const preloads = detectFontsToPreload(fonts);
  return { fontStyles: fonts, preloads };
};

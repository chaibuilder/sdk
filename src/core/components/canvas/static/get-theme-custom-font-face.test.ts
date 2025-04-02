import { ChaiCustomFont } from "@chaibuilder/runtime";
import { getThemeCustomFontFace } from "./chai-theme-helpers";

describe("getThemeCustomFontFace", () => {
  it("should return empty string for empty array input", () => {
    expect(getThemeCustomFontFace([])).toBe("");
    expect(getThemeCustomFontFace(undefined)).toBe("");
  });

  it("should generate @font-face for a single font with basic properties", () => {
    const fonts: ChaiCustomFont[] = [
      {
        family: "TestFont",
        src: [{ url: "/fonts/test.woff2", format: "woff2" }],
        fallback: "sans-serif",
      },
    ];

    const result = getThemeCustomFontFace(fonts);
    expect(result).toContain("@font-face");
    expect(result).toContain('font-family: "TestFont"');
    expect(result).toContain('src: url("/fonts/test.woff2") format("woff2")');
  });

  it("should handle multiple font sources", () => {
    const fonts: ChaiCustomFont[] = [
      {
        family: "TestFont",
        src: [
          { url: "/fonts/test.woff2", format: "woff2" },
          { url: "/fonts/test.ttf", format: "truetype" },
        ],
        fallback: "sans-serif",
      },
    ];

    const result = getThemeCustomFontFace(fonts);
    expect(result).toContain('src: url("/fonts/test.woff2") format("woff2")');
    expect(result).toContain('src: url("/fonts/test.ttf") format("truetype")');
  });

  it("should include optional font properties when provided", () => {
    const fonts: ChaiCustomFont[] = [
      {
        family: "TestFont",
        src: [
          { url: "/fonts/test.woff2", format: "woff2", fontWeight: "700", fontStyle: "italic", fontDisplay: "swap" },
        ],
        fallback: "sans-serif",
      },
    ];

    const result = getThemeCustomFontFace(fonts);
    expect(result).toContain("font-weight: 700;");
    expect(result).toContain("font-style: italic;");
    expect(result).toContain("font-display: swap;");
  });

  it("should handle multiple fonts", () => {
    const fonts: ChaiCustomFont[] = [
      {
        family: "FirstFont",
        src: [{ url: "/fonts/first.woff2", format: "woff2" }],
        fallback: "sans-serif",
      },
      {
        family: "SecondFont",
        src: [{ url: "/fonts/second.woff2", format: "woff2" }],
        fallback: "sans-serif",
      },
    ];

    const result = getThemeCustomFontFace(fonts);
    expect(result).toContain('font-family: "FirstFont"');
    expect(result).toContain('font-family: "SecondFont"');
    expect(result.split("@font-face").length).toBe(3); // 2 declarations + 1 from split
  });
});

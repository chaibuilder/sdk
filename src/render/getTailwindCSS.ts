import { get, replace, startsWith } from "lodash-es";
import { createTailwindcss } from "@mhsdesign/jit-browser-tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import plugin from "tailwindcss/plugin";
import twForms from "@tailwindcss/forms";
import twTypography from "@tailwindcss/typography";
import twAspectRatio from "@tailwindcss/aspect-ratio";
import { ChaiBlock } from "../core/types/ChaiBlock.ts";
import { addPrefixToClasses, ChaiPageData } from "./functions.ts";
import { STYLES_KEY } from "../core/constants/STRINGS.ts";
import { ThemeConfiguration } from "../core/types";
import getPalette from "tailwindcss-palette-generator";

export async function getTailwindCSS(
  customTheme: any,
  markupString: string[],
  safelist: string[] = [],
  prefix: string = "",
  includeBaseStyles: boolean = false,
) {
  const primary = get(customTheme, "primaryColor", "#000");
  const secondary = get(customTheme, "secondaryColor", "#ccc");

  const headingFont = get(customTheme, "headingFont", "Inter");
  const bodyFont = get(customTheme, "bodyFont", "Inter");
  const borderRadius = get(customTheme, "roundedCorners", "0");
  const BG_LIGHT_MODE = get(customTheme, "bodyBgLightColor", "#fff");
  const BG_DARK_MODE = get(customTheme, "bodyBgDarkColor", "#000");
  const TEXT_DARK_MODE = get(customTheme, "bodyTextDarkColor", "#FFF");
  const TEXT_LIGHT_MODE = get(customTheme, "bodyTextLightColor", "#000");

  const colors: Record<string, string> = {
    "bg-light": BG_LIGHT_MODE,
    "bg-dark": BG_DARK_MODE,
    "text-dark": TEXT_DARK_MODE,
    "text-light": TEXT_LIGHT_MODE,
  };

  const palette = getPalette([
    { color: primary, name: "primary" },
    { color: secondary, name: "secondary" },
  ]);

  const tailwind = createTailwindcss({
    tailwindConfig: {
      darkMode: "class",
      safelist,
      theme: {
        container: {
          center: true,
          padding: "1rem",
          screens: { "2xl": "1400px" },
        },
        fontFamily: {
          heading: [headingFont, ...defaultTheme.fontFamily.sans],
          body: [bodyFont, ...defaultTheme.fontFamily.sans],
        },
        extend: {
          borderRadius: {
            DEFAULT: `${!borderRadius ? "0px" : borderRadius}px`,
          },
          colors: { ...colors, ...palette },
        },
      },
      plugins: [
        twForms,
        twTypography,
        twAspectRatio,
        plugin(function ({ addBase, theme }: any) {
          addBase({
            "h1,h2,h3,h4,h5,h6": {
              fontFamily: theme("fontFamily.heading"),
            },
            body: {
              fontFamily: theme("fontFamily.body"),
              color: theme("colors.text-light"),
              backgroundColor: theme("colors.bg-light"),
            },
            ".dark body": {
              color: theme("colors.text-dark"),
              backgroundColor: theme("colors.bg-dark"),
            },
          });
        }),
      ],
      corePlugins: { preflight: includeBaseStyles },
      ...(prefix ? { prefix: `${prefix}` } : {}),
    },
  });

  return await tailwind.generateStylesFromContent(
    ` ${includeBaseStyles ? "@tailwind base;" : ""}
      @tailwind components;
      @tailwind utilities;`,
    markupString,
  );
}

const addPrefixToBlockStyles = (blocks: ChaiBlock[], prefix: string) => {
  return blocks.map((block: any) => {
    // loop through all block keys and check if it starts with #styles:
    // if it does, then replace "#styles:" with the empty string
    const blocksStyles = {};
    Object.keys(block).forEach((key) => {
      if (startsWith(block[key], STYLES_KEY)) {
        blocksStyles[key] = addPrefixToClasses(block[key], prefix);
      }
    });
    return blocksStyles;
  });
};

export const getBlocksTailwindCSS = (
  blocks: ChaiBlock[],
  theme: any,
  prefix: string = "",
  includeBaseStyles: boolean = false,
) => {
  return getTailwindCSS(
    theme,
    [replace(JSON.stringify(addPrefixToBlockStyles(blocks, prefix)), /#styles:/g, "")],
    [],
    prefix,
    includeBaseStyles,
  );
};

export const getStylesForPageData = async (
  pageData: ChaiPageData,
  classPrefix: string = "",
  includeBaseStyles: boolean = false,
): Promise<string> => {
  const blocks = pageData.page.blocks;
  return await getBlocksTailwindCSS(blocks, pageData.project.brandingOptions, classPrefix, includeBaseStyles);
};

export const getStylesForBlocks = async (
  blocks: ChaiBlock[],
  theme: ThemeConfiguration,
  classPrefix: string = "",
  includeBaseStyles: boolean = true,
): Promise<string> => {
  return await getBlocksTailwindCSS(blocks, theme, classPrefix, includeBaseStyles);
};

import { get, replace, startsWith } from "lodash-es";
import { createTailwindcss } from "@mhsdesign/jit-browser-tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import twForms from "@tailwindcss/forms";
import twTypography from "@tailwindcss/typography";
import twAspectRatio from "@tailwindcss/aspect-ratio";
import { ChaiBlock } from "../core/types/ChaiBlock.ts";
import { addPrefixToClasses, ChaiPageData, getBrandingClasses } from "./functions.ts";
import { STYLES_KEY } from "../core/constants/STRINGS.ts";
import { BrandingOptions } from "../core/types/index";
import getPalette from "tailwindcss-palette-generator";

export async function getTailwindCSS(
  options: any,
  markupString: string[],
  safelist: string[] = [],
  prefix: string = "c-",
  includeBaseStyles: boolean = false,
) {
  const primary = get(options, "primaryColor", "#000");
  const secondary = get(options, "secondaryColor", "#ccc");

  const headingFont = get(options, "headingFont", "Inter");
  const bodyFont = get(options, "bodyFont", "Inter");
  const borderRadius = get(options, "roundedCorners", "0");
  const colors = getPalette([
    { color: primary, name: "primary" },
    { color: secondary, name: "secondary" },
  ]);
  const tailwind = createTailwindcss({
    tailwindConfig: {
      darkMode: "class",
      safelist,
      theme: {
        fontFamily: {
          heading: [headingFont, ...defaultTheme.fontFamily.sans],
          body: [bodyFont, ...defaultTheme.fontFamily.sans],
        },
        extend: {
          borderRadius: {
            global: `${!borderRadius ? "0" : borderRadius}px`,
          },
          colors,
        },
      },
      plugins: [twForms, twTypography, twAspectRatio],
      corePlugins: { preflight: includeBaseStyles },
      ...(prefix ? { prefix: `${prefix}` } : {}),
    },
  });

  const css = await tailwind.generateStylesFromContent(
    ` ${includeBaseStyles ? "@tailwind base;" : ""}
      @tailwind components;
      @tailwind utilities;`,
    markupString,
  );
  return `${css} 
    .${prefix}bg-clip-text{background-clip: text;-webkit-background-clip: text;} h1,h2,h3,h4,h5,h6{font-family: "${headingFont}",${defaultTheme.fontFamily.sans.join(
      ", ",
    )};}`;
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
  brandingOptions: any,
  prefix: string = "c-",
  includeBaseStyles: boolean = false,
) => {
  const brandingClasses = getBrandingClasses(brandingOptions, prefix);
  return getTailwindCSS(
    brandingOptions,
    [replace(JSON.stringify(addPrefixToBlockStyles(blocks, prefix)), /#styles:/g, "")],
    brandingClasses.split(" ").concat(`${prefix}inline-block`, `${prefix}w-full`, `${prefix}h-full`),
    prefix,
    includeBaseStyles,
  );
};

export const getStylesForPageData = async (
  pageData: ChaiPageData,
  classPrefix: string = "c-",
  includeBaseStyles: boolean = false,
): Promise<string> => {
  //TODO: add support for subpages
  const blocks = pageData.page.blocks;
  return await getBlocksTailwindCSS(blocks, pageData.project.brandingOptions, classPrefix, includeBaseStyles);
};

export const getStylesForBlocks = async (
  blocks: ChaiBlock[],
  brandingOptions: BrandingOptions,
  classPrefix: string = "c-",
  includeBaseStyles: boolean = false,
): Promise<string> => {
  return await getBlocksTailwindCSS(blocks, brandingOptions, classPrefix, includeBaseStyles);
};

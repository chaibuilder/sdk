import { get, includes, last, replace, set, startsWith } from "lodash";
import { createTailwindcss } from "@mhsdesign/jit-browser-tailwindcss";
import { tailwindcssPaletteGenerator } from "@bobthered/tailwindcss-palette-generator";
import defaultTheme from "tailwindcss/defaultTheme";
import twForms from "@tailwindcss/forms";
import twTypography from "@tailwindcss/typography";
import twAspectRatio from "@tailwindcss/aspect-ratio";
import twLineClamp from "@tailwindcss/line-clamp";
import { ChaiBlock } from "../core/types/ChaiBlock.ts";
import { STYLES_KEY } from "../core/constants/CONTROLS.ts";

type BrandingOptions = {
  bodyTextLightColor?: string;
  bodyTextDarkColor?: string;
  bodyBgLightColor?: string;
  bodyBgDarkColor?: string;
};

export const getBrandingClasses = (brandingOptions: BrandingOptions, prefix: string = "c-") => {
  const textLight = get(brandingOptions, "bodyTextLightColor", "#64748b");
  const textDark = get(brandingOptions, "bodyTextDarkColor", "#94a3b8");
  const bgLight = get(brandingOptions, "bodyBgLightColor", "#FFFFFF");
  const bgDark = get(brandingOptions, "bodyBgDarkColor", "#0f172a");
  // @ts-ignore
  return `${prefix}font-body ${prefix}antialiased ${prefix}text-[${textLight}] ${prefix}bg-[${bgLight}] dark:${prefix}text-[${textDark}] dark:${prefix}bg-[${bgDark}]`;
};

export const addPrefixToClasses = (classes: string, prefix: string = "c-") => {
  const classesArray = classes.replace(STYLES_KEY, "").split(",");
  const array = classesArray.map((item) => {
    const classes = item.split(" ");
    const newClasses = classes.map((item) => {
      if (item === "") return "";
      if (includes(item, "hs-") || includes(item, "[--") || includes(item, "paddle")) return item;
      // if the class had a state of media query, then prefix the classes
      // eg: dark:hover:bg-red-500 => dark:hover:c-bg-red-500
      // eg: hover:bg-red-500 => hover:c-bg-red-500
      if (item.includes(":")) {
        const values = item.split(":");
        // replace the last value from values with prefixedClass
        values[values.length - 1] = prefix + last(values);
        return values.join(":");
      }
      return `${prefix}${item}`;
    });
    return newClasses.join(" ");
  });
  return `${STYLES_KEY}${array.join(" , ")}`;
};

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

export const getBlocksTailwindCSS = (blocks: ChaiBlock[], brandingOptions: any, prefix: string = "c-") => {
  const brandingClasses = getBrandingClasses(brandingOptions, prefix);
  return getTailwindCSS(
    brandingOptions,
    [replace(JSON.stringify(addPrefixToBlockStyles(blocks, prefix)), /#styles:/g, "")],
    brandingClasses.split(" ").concat(`${prefix}inline-block`, `${prefix}w-full`, `${prefix}h-full`),
  );
};

export type ChaiPageData = {
  page: {
    blocks: ChaiBlock[];
    seoData?: Record<string, string>;
    slug?: string;
    name: string;
    providers: { providerKey: string; args: Record<string, any> }[];
  };
  subPages?: {
    uuid: string;
    blocks: ChaiBlock[];
    providers: { providerKey: string; args: Record<string, any> }[];
  }[];
  project: {
    name: string;
    favicon: string;
    brandingOptions: Record<string, string | number>;
    seoData?: Record<string, string>;
    primaryLanguage: string;
    languages: string[];
    homepage: string;
  };
};

export const getStylesForPageData = async (pageData: ChaiPageData, classPrefix: string = "c-"): Promise<string> => {
  //TODO: add support for subpages
  const blocks = pageData.page.blocks;
  return await getBlocksTailwindCSS(blocks, pageData.project.brandingOptions, classPrefix);
};

async function getTailwindCSS(options: any, markupString: string[], safelist: string[] = [], prefix: string = "c-") {
  const primary = get(options, "primaryColor", "#000");
  const secondary = get(options, "secondaryColor", "#ccc");

  const headingFont = get(options, "headingFont", "Inter");
  const bodyFont = get(options, "bodyFont", "Inter");
  const borderRadius = get(options, "roundedCorners", "0");
  const colors = tailwindcssPaletteGenerator({
    colors: [primary, secondary],
    names: ["primary", "secondary"],
  });
  set(colors, "primary.DEFAULT", primary);
  set(colors, "secondary.DEFAULT", secondary);
  const tailwind = createTailwindcss({
    tailwindConfig: {
      prefix,
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
      plugins: [twForms, twTypography, twAspectRatio, twLineClamp],
      corePlugins: { preflight: false },
    },
  });

  const css = await tailwind.generateStylesFromContent(
    ` @tailwind components;
      @tailwind utilities;`,
    markupString,
  );
  return `${css} .${prefix}bg-clip-text{background-clip: text;-webkit-background-clip: text;} h1,h2,h3,h4,h5,h6{font-family: "${headingFont}",${defaultTheme.fontFamily.sans.join(
    ", ",
  )};}`;
}

/**
 * Get the unique uuid
 */
export function generateUUID(length: number = 6, chars = "abcdefghijklmnopqrstuvwxyzABCD"): string {
  let result = "";
  for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

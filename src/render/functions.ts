import { get, includes, last } from "lodash";
import { ChaiBlock } from "../core/types/ChaiBlock.ts";
import { STYLES_KEY } from "../core/constants/CONTROLS.ts";
import { BrandingOptions } from "../core/types/index.ts";

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

export type ChaiPageData = {
  page: {
    blocks: ChaiBlock[];
    seoData?: Record<string, string>;
    slug?: string;
    name?: string;
    providers?: { providerKey: string; args: Record<string, any> }[];
  };
  subPages?: {
    uuid: string;
    blocks: ChaiBlock[];
    providers: { providerKey: string; args: Record<string, any> }[];
  }[];
  project: {
    name?: string;
    favicon?: string;
    brandingOptions: Record<string, string | number>;
    seoData?: Record<string, string>;
    primaryLanguage?: string;
    languages?: string[];
    homepage?: string;
  };
};

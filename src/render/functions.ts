import { flattenDeep, get, last } from "lodash-es";
import { ChaiBlock } from "../core/types/ChaiBlock.ts";
import { STYLES_KEY } from "../core/constants/STRINGS.ts";
import { ThemeConfiguration } from "../core/types";

export const getBrandingClasses = (brandingOptions: ThemeConfiguration, prefix: string = "") => {
  const textLight = get(brandingOptions, "bodyTextLightColor", "#64748b");
  const textDark = get(brandingOptions, "bodyTextDarkColor", "#94a3b8");
  const bgLight = get(brandingOptions, "bodyBgLightColor", "#FFFFFF");
  const bgDark = get(brandingOptions, "bodyBgDarkColor", "#0f172a");
  // @ts-ignore
  return `${prefix}font-body ${prefix}antialiased ${prefix}text-[${textLight}] ${prefix}bg-[${bgLight}] dark:${prefix}text-[${textDark}] dark:${prefix}bg-[${bgDark}]`;
};

export const addPrefixToClasses = (classes: string, prefix: string = "") => {
  const classesArray = classes.replace(STYLES_KEY, "").split(",");
  const array = classesArray.map((item) => {
    const classes = item.split(" ");
    const newClasses = classes.map((item) => {
      if (item === "") return "";
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
  return flattenDeep(array).join(" ");
};

export const convertToBlocks = (jsonString: string): ChaiBlock[] => {
  if (!jsonString) return [];
  try {
    const blocks = JSON.parse(jsonString);
    //remove the blocks whose _type starts with @chai
    return blocks.filter((block) => !block._type.startsWith("@chai"));
  } catch (error) {
    return [{ _type: "Paragraph", _id: "error", content: "Invalid JSON. Please check the JSON string." }];
  }
};

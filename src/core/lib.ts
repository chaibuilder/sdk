export * from "../ui/radix/lib/utils";
export { generateUUID, getBreakpointValue } from "./functions/functions";
export { getBlocksFromHTML } from "./import-html/html-to-json";
export { convertArbitraryToTailwindClass } from "./functions/ConvertArbitraryToTailwindClass.ts";
export * from "../render/functions.ts";

export const setBlockProps = (attrs: Record<string, string>) => ({ ...attrs });
export const enableStyling = (attrs: Record<string, string>) => ({ ...attrs });

export * from "../ui/radix/lib/utils";
export { generateUUID, getBreakpointValue } from "./functions/Functions.ts";
export { getBlocksFromHTML } from "./import-html/html-to-json";
export { convertArbitraryToTailwindClass } from "./functions/ConvertArbitraryToTailwindClass";
export * from "../render/functions";

export const selectable = (attrs: Record<string, string>) => ({ ...attrs });
export const styling = (attrs: Record<string, string>) => ({ ...attrs });

export { chaiBuilderTheme } from "./tailwind-config";

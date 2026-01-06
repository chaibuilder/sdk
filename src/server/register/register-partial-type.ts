import { ChaiBuilderPageType } from "../types";
import { PAGE_TYPES } from "./register-page-type";

export const registerChaiPartialType = (
  key: string,
  pageTypeOptions: Omit<ChaiBuilderPageType, "key">
) => {
  PAGE_TYPES[key] = { key, ...pageTypeOptions, hasSlug: false };
};

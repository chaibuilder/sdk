import type { RJSFSchema, UiSchema } from "@rjsf/utils";
import { each, get, intersection, isEmpty, keys, omit } from "lodash-es";
import { ChaiBlockDefinition, ChaiDataProviderArgs, ChaiServerBlockDefinition } from "./controls/types.ts";
import type { ChaiBlock, ChaiBlockComponentProps, ChaiStyles } from "./v2/runtime/core.tsx";

const STYLES_KEY = "#styles:";

type ChaiBlockUiSchema = UiSchema;
type ChaiBlockPropSchema = RJSFSchema & {
  ui?: ChaiBlockUiSchema;
  default: any;
};

type ChaiBlockSchema = {
  properties?: Record<string, ChaiBlockPropSchema>;
  allOf?: any[];
  oneOf?: any[];
} & Partial<Pick<ChaiBlockPropSchema, "required" | "dependencies" | "ui" | "title" | "description" | "default">>;

type ChaiBlockSchemas = {
  schema: object | Omit<ChaiBlockSchema, "ui">;
  uiSchema?: ChaiBlockUiSchema;
};

export const registerChaiBlockSchema = (blockSchema: ChaiBlockSchema): ChaiBlockSchemas => {
  const reservedProps = ["_type", "_id", "_parent", "_bindings", "_name"];
  const runtimeProps = ["$loading", "blockProps", "inBuilder", "lang", "draft", "pageProps", "pageData", "children"];
  const propsKeys = keys(blockSchema.properties);

  if (intersection(propsKeys, reservedProps).length > 0) {
    throw new Error(`Reserved props are not allowed: ${intersection(propsKeys, reservedProps).join(", ")}`);
  }

  if (intersection(propsKeys, runtimeProps).length > 0) {
    throw new Error(`Runtime props are not allowed in schema: ${intersection(propsKeys, runtimeProps).join(", ")}`);
  }

  const schema = get(blockSchema, "properties", {}) as Record<string, ChaiBlockPropSchema>;
  const uiSchema = {};
  each(schema, (prop, key) => {
    if (!isEmpty(prop.ui)) {
      uiSchema[key] = { ...prop.ui };
      delete schema[key].ui;
    }
  });
  return {
    schema: isEmpty(schema) ? {} : { ...omit(blockSchema, ["ui"]) },
    uiSchema: { ...get(blockSchema, "ui", {}), ...uiSchema },
  };
};

export const StylesProp = (defaultClasses: string = ""): ChaiBlockPropSchema => {
  return {
    type: "string",
    styles: true,
    default: `${STYLES_KEY},${defaultClasses}`,
    ui: { "ui:widget": "hidden" },
  };
};

export const stylesProp = (defaultClasses: string = ""): ChaiBlockPropSchema => {
  return {
    type: "string",
    styles: true,
    default: `${STYLES_KEY},${defaultClasses}`,
    ui: { "ui:widget": "hidden" },
  };
};

export const runtimeProp = (options: ChaiBlockPropSchema): ChaiBlockPropSchema => {
  console.warn("runtimeProp is deprecated, use builderProp instead");
  return {
    runtime: true,
    ...options,
  };
};

export const builderProp = (options: ChaiBlockPropSchema): ChaiBlockPropSchema => {
  return {
    builderProp: true,
    ...options,
  };
};

export const defaultChaiStyles = (classes: string) => `${STYLES_KEY},${classes}`;

type ChaiAsyncProp<T> = T | undefined;
type ChaiClosestBlockProp<T> = T | undefined;

export * from "./register-collection.ts";
export * from "./register-global-data-provider";
export * from "./register-page-type";
export * from "./register-partial-type";
export * from "./register-chai-flag.tsx";
export * from "./register-chai-library.ts";
export * from "./register-chai-top-bar.tsx";
export * from "./register-chai-save-to-library.tsx";
export * from "./register-chai-media-manager.tsx";
export * from "./register-chai-add-block-tab.tsx";
export * from "./register-chai-sidebar-panel.tsx";
export * from "./register-chai-pre-import-html-hook.ts";
export * from "./v2/runtime/index.tsx";
export type {
  ChaiAsyncProp,
  ChaiBlock,
  ChaiBlockComponentProps,
  ChaiBlockDefinition,
  ChaiBlockPropSchema,
  ChaiBlockSchema,
  ChaiBlockSchemas,
  ChaiBlockUiSchema,
  ChaiDataProviderArgs,
  ChaiClosestBlockProp as ChaiRuntimeProp,
  ChaiServerBlockDefinition,
  ChaiStyles,
};

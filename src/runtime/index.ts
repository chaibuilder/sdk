import { STYLES_KEY } from "@/core/constants/STRINGS.ts";
import { ChaiBlockPropSchema, ChaiBlockPropsSchema, ChaiBlockRJSFSchemas, ChaiBlockUiSchema } from "@/types/common.ts";
import { each, get, intersection, isEmpty, keys, omit } from "lodash-es";

export const registerChaiBlockSchema = (blockSchema: ChaiBlockPropsSchema): ChaiBlockRJSFSchemas => {
  console.warn("registerChaiBlockSchema is deprecated, use registerChaiBlock instead");
  return registerChaiBlockProps(blockSchema);
};

export const registerChaiBlockProps = (blockSchema: ChaiBlockPropsSchema): ChaiBlockRJSFSchemas => {
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
  const uiSchema = {} as Record<string, ChaiBlockUiSchema>;
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
  console.warn("StylesProp is deprecated, use stylesProp instead");
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

export * from "./register-collection.ts";
export * from "./register-global-data-provider";
export * from "./register-page-type";
export * from "./register-partial-type";
export * from "./v2/runtime";

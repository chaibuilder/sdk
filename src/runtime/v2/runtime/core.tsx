import type { ChaiBlockConfig, ChaiServerBlockConfig } from "@/types/blocks";
import { ChaiBlockComponentProps } from "@/types/blocks.ts";
import { ChaiBlock, ChaiPageProps } from "@/types/common";
import { ChaiBlockPropSchema } from "@/types/common.ts";
import type { RJSFSchema, UiSchema } from "@rjsf/utils";
import { cloneDeep, each, get, has, omitBy, set } from "lodash-es";
import React, { useMemo } from "react";

const REGISTERED_CHAI_BLOCKS: Record<
  string,
  (ChaiBlockConfig | ChaiServerBlockConfig) & { component: React.ComponentType<ChaiBlockComponentProps> }
> = {};

export const useRegisteredChaiBlocks = () => {
  return REGISTERED_CHAI_BLOCKS;
};

export const useRegisteredChaiBlock = (type: keyof typeof REGISTERED_CHAI_BLOCKS) => {
  return useMemo(() => get(REGISTERED_CHAI_BLOCKS, type, null), [type]);
};

export const getRegisteredChaiBlock = (type: keyof typeof REGISTERED_CHAI_BLOCKS): ChaiBlockConfig | null => {
  return get(REGISTERED_CHAI_BLOCKS, type, null) as ChaiBlockConfig | null;
};

export const getDefaultBlockProps = (type: keyof typeof REGISTERED_CHAI_BLOCKS) => {
  const properties = get(REGISTERED_CHAI_BLOCKS, `${type}.schema.properties`, {});
  const defaultProps: Record<string, any> = {};
  each(properties, (propSchema: ChaiBlockPropSchema, key) => {
    if (has(propSchema, "block")) {
      return;
    }
    set(defaultProps, key, propSchema.default);
  });
  return defaultProps;
};

export const getI18nBlockProps = (type: keyof typeof REGISTERED_CHAI_BLOCKS) => {
  return get(REGISTERED_CHAI_BLOCKS, `${type}.i18nProps`, []);
};

export const getAIBlockProps = (type: keyof typeof REGISTERED_CHAI_BLOCKS) => {
  return get(REGISTERED_CHAI_BLOCKS, `${type}.aiProps`, []);
};

export const getBlockFormSchemas = (
  type: keyof typeof REGISTERED_CHAI_BLOCKS,
): { schema: RJSFSchema; uiSchema: UiSchema } | null => {
  const registeredBlock = getRegisteredChaiBlock(type);
  if (!registeredBlock) {
    return null;
  }
  const schema = cloneDeep(registeredBlock.schema) as RJSFSchema;
  const properties = get(schema, "properties", {}) as Record<string, any>;
  const nonStylesProperties = omitBy(properties, (prop) => prop?.styles === true);
  set(schema, "properties", nonStylesProperties);
  const uiSchema = get(REGISTERED_CHAI_BLOCKS, `${type}.uiSchema`, {});
  return { schema, uiSchema };
};

export const syncBlocksWithDefaults = (blocks: ChaiBlock[]): ChaiBlock[] => {
  return blocks.map((block) => {
    if (has(REGISTERED_CHAI_BLOCKS, block._type)) {
      const defaults = getDefaultBlockProps(block._type);
      return { ...defaults, ...block } as ChaiBlock;
    }
    return block;
  });
};

const registerInternalBlock = (component: React.ComponentType<ChaiBlockComponentProps>, options: ChaiBlockConfig) => {
  const existingBlock = get(REGISTERED_CHAI_BLOCKS, options.type);
  if (existingBlock) {
    set(REGISTERED_CHAI_BLOCKS, options.type, { ...existingBlock, component, ...options });
  } else {
    set(REGISTERED_CHAI_BLOCKS, options.type, { component, ...options });
  }
};

export const registerChaiBlock = (
  component: React.ComponentType<ChaiBlockComponentProps>,
  options: ChaiBlockConfig,
) => {
  registerInternalBlock(component, { ...options, ...{ category: options.category || "core" } });
};

export const registerChaiServerBlock = (
  component: React.ComponentType<ChaiBlockComponentProps>,
  options: Pick<ChaiBlockConfig, "type" | "dataProvider" | "i18nProps" | "aiProps">,
) => {
  const existingBlock = get(REGISTERED_CHAI_BLOCKS, options.type);
  if (existingBlock) {
    set(REGISTERED_CHAI_BLOCKS, options.type, { ...existingBlock, component, ...options });
  } else {
    set(REGISTERED_CHAI_BLOCKS, options.type, { component, ...options });
  }
};

export const setChaiServerBlockDataProvider = <K extends Record<string, any> = Record<string, any>>(
  type: keyof typeof REGISTERED_CHAI_BLOCKS,
  dataProvider: (args: {
    lang: string;
    draft: boolean;
    inBuilder: boolean;
    block: ChaiBlock<K>;
    pageProps: ChaiPageProps;
  }) => Promise<K>,
) => {
  const registeredBlock = getRegisteredChaiBlock(type);
  set(REGISTERED_CHAI_BLOCKS, type, { ...registeredBlock, dataProvider });
};

export const setChaiBlockComponent = (
  type: keyof typeof REGISTERED_CHAI_BLOCKS,
  component: React.ComponentType<ChaiBlockComponentProps>,
) => {
  const registeredBlock = getRegisteredChaiBlock(type);
  set(REGISTERED_CHAI_BLOCKS, type, { ...registeredBlock, component });
};

export const closestBlockProp = (blockType: keyof typeof REGISTERED_CHAI_BLOCKS, prop: string): ChaiBlockPropSchema => {
  return {
    type: "null",
    block: blockType,
    prop,
    default: null,
    runtime: true,
    ui: { "ui:widget": "hidden" },
  };
};

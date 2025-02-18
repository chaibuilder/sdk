import { getRegisteredChaiBlock } from "@chaibuilder/runtime";
import {
  cloneDeep,
  filter,
  find,
  forEach,
  get,
  has,
  includes,
  isEmpty,
  isString,
  keys,
  memoize,
  omit,
} from "lodash-es";
import React, { createElement, Suspense } from "react";
import { twMerge } from "tailwind-merge";
import { STYLES_KEY } from "../core/constants/STRINGS.ts";
import { getSplitChaiClasses } from "../core/hooks/getSplitClasses.ts";
import { ChaiBlock } from "../core/types/ChaiBlock.ts";
import AsyncPropsBlock from "./AsyncBlockProps.tsx";
import { addPrefixToClasses } from "./functions.ts";

const generateClassNames = memoize((styles: string, classPrefix: string) => {
  const { baseClasses, classes: classesString } = getSplitChaiClasses(styles);
  const classes = twMerge(baseClasses, classesString);

  if (classPrefix === "") return classes.replace(STYLES_KEY, "").trim();
  // split classes by space and add prefix to each class
  return addPrefixToClasses(classes, classPrefix).replace(STYLES_KEY, "").trim();
});

function getElementAttrs(block: ChaiBlock, key: string) {
  const attrs = get(block, `${key}_attrs`, {}) as Record<string, string>;
  const attrsKeys = keys(attrs).join(" ");
  if (includes(attrsKeys, "x-show") && !includes(attrsKeys, "x-transition")) {
    attrs["x-transition"] = "";
  }
  return attrs;
}

function getStyleAttrs(block: ChaiBlock, classPrefix: string) {
  const styles: { [key: string]: { className: string } } = {};
  Object.keys(block).forEach((key) => {
    if (isString(block[key]) && block[key].startsWith(STYLES_KEY)) {
      const classes = generateClassNames(block[key], classPrefix);
      styles[key] = {
        className: classes,
        ...getElementAttrs(block, key),
      };
    }
  });
  return styles;
}

function applyLanguage(_block: ChaiBlock, lang: string, blockDefinition) {
  if (isEmpty(lang)) return _block;
  const block = cloneDeep(_block);
  const i18nProps = get(blockDefinition, "i18nProps", []);
  forEach(keys(block), (key) => {
    if (i18nProps.includes(key) && !isEmpty(lang)) {
      block[key] = get(block, `${key}-${lang}`, block[key]);
    }
  });
  return block;
}

const getRuntimeProps = memoize((blockType: string) => {
  const chaiBlock = getRegisteredChaiBlock(blockType) as any;
  const props = get(chaiBlock, "schema.properties", {});
  // return key value with value has runtime: true
  return Object.fromEntries(Object.entries(props).filter(([, value]) => get(value, "runtime", false)));
});

const getRuntimePropValues = (allBlocks: ChaiBlock[], blockId: string, runtimeProps: Record<string, any>) => {
  if (isEmpty(runtimeProps)) return {};
  return Object.entries(runtimeProps).reduce((acc, [key, schema]) => {
    const hierarchy = [];
    let block = find(allBlocks, { _id: blockId });
    while (block) {
      hierarchy.push(block);
      block = find(allBlocks, { _id: block._parent });
    }
    const matchingBlock = find(hierarchy, { _type: schema.block });
    if (matchingBlock) {
      acc[key] = get(matchingBlock, get(schema, "prop"), null);
    }
    return acc;
  }, {});
};

const SuspenseFallback = () => <span>Loading...</span>;

export function RenderChaiBlocks({
  blocks,
  parent,
  classPrefix = "",
  externalData = {},
  blockModifierCallback = null,
  lang = "",
  fallbackLang = "",
  metadata = {},
}: {
  blocks: ChaiBlock[];
  parent?: string;
  classPrefix?: string;
  externalData?: Record<string, any>;
  blockModifierCallback?: (block: ChaiBlock) => ChaiBlock;
  lang?: string;
  fallbackLang?: string;
  metadata?: Record<string, any>;
}) {
  const allBlocks = blocks;
  const getStyles = (block: ChaiBlock) => getStyleAttrs(block, classPrefix);
  const filteredBlocks = parent
    ? filter(blocks, { _parent: parent })
    : filter(blocks, (block) => isEmpty(block._parent));

  return (
    <>
      {React.Children.toArray(
        filteredBlocks.map((block: ChaiBlock, index: number) => {
          const attrs: any = {};
          const blocks = filter(allBlocks, { _parent: block._id });
          attrs.children =
            blocks.length > 0 ? (
              <RenderChaiBlocks
                externalData={externalData}
                classPrefix={classPrefix}
                parent={block._id}
                blocks={allBlocks}
                lang={lang || fallbackLang}
                metadata={metadata}
              />
            ) : null;

          const blockDefinition = getRegisteredChaiBlock(block._type);
          if (blockDefinition !== null) {
            let syncedBlock: ChaiBlock = block;
            // @ts-ignore
            const Component: React.FC<any> = (blockDefinition as { component: React.FC<ChaiBlock> }).component;
            syncedBlock = { ...(blockDefinition as any).defaults, ...block };
            if (blockModifierCallback) {
              syncedBlock = blockModifierCallback(syncedBlock);
            }
            const langToUse = lang === fallbackLang ? "" : lang;
            const runtimeProps = getRuntimePropValues(allBlocks, block._id, getRuntimeProps(block._type));
            const props = omit(
              {
                blockProps: {},
                inBuilder: false,
                ...syncedBlock,
                index,
                ...applyLanguage(block, langToUse, blockDefinition),
                ...getStyles(syncedBlock),
                ...attrs,
                ...runtimeProps,
                metadata,
                lang: lang || fallbackLang,
              },
              ["_parent"],
            );
            if (has(blockDefinition, "dataProvider")) {
              const suspenseFallback = get(
                blockDefinition,
                "suspenseFallback",
                SuspenseFallback,
              ) as React.ComponentType<any>;

              return (
                <Suspense fallback={createElement(suspenseFallback)}>
                  {/* @ts-ignore */}
                  <AsyncPropsBlock
                    lang={lang || fallbackLang}
                    metadata={metadata}
                    dataProvider={blockDefinition.dataProvider}
                    block={block}
                    component={Component}
                    props={props}
                  />
                </Suspense>
              );
            }
            return <Suspense>{React.createElement(Component, props)}</Suspense>;
          }

          return <noscript>{block._type} not found</noscript>;
        }),
      )}
    </>
  );
}

import React, { Suspense } from "react";
import { each, filter, get, includes, isEmpty, isString, keys, memoize, omit, cloneDeep, forEach } from "lodash-es";
import { twMerge } from "tailwind-merge";
import { ChaiBlock } from "../core/types/ChaiBlock.ts";
import { STYLES_KEY } from "../core/constants/STRINGS.ts";
import { getRegisteredChaiBlock } from "@chaibuilder/runtime";
import { addPrefixToClasses } from "./functions.ts";
import { has } from "lodash-es";
import AsyncPropsBlock from "./AsyncBlockProps.tsx";

const generateClassNames = memoize((styles: string, classPrefix: string) => {
  const stylesArray = styles.replace(STYLES_KEY, "").split(",");
  const classes = twMerge(stylesArray[0], stylesArray[1]);
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

function applyBindings(block: ChaiBlock, chaiData: any): ChaiBlock {
  const bindings = get(block, "_bindings", {});
  if (isEmpty(bindings)) return { ...block };
  each(bindings, (value, key) => {
    if (isString(value) && get(chaiData, value, null)) {
      block[key] = get(chaiData, value, null);
    }
  });
  return block;
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

export function RenderChaiBlocks({
  blocks,
  parent,
  classPrefix = "",
  externalData = {},
  blockModifierCallback,
  lang,
  metadata = {},
}: {
  blocks: ChaiBlock[];
  parent?: string;
  classPrefix?: string;
  externalData?: Record<string, any>;
  blockModifierCallback?: (block: ChaiBlock) => ChaiBlock;
  lang?: string;
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
                lang={lang}
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
            const props = omit(
              {
                blockProps: {},
                inBuilder: false,
                ...syncedBlock,
                index,
                ...applyBindings(applyLanguage(block, lang, blockDefinition), externalData),
                ...getStyles(syncedBlock),
                ...attrs,
                metadata,
                lang,
              },
              ["_parent"],
            );
            if (has(blockDefinition, "dataProvider")) {
              return (
                <Suspense>
                  {/* @ts-ignore */}
                  <AsyncPropsBlock
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

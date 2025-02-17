import { getRegisteredChaiBlock } from "@chaibuilder/runtime";
import { useAtom } from "jotai";
import {
  cloneDeep,
  filter,
  find,
  forEach,
  get,
  has,
  includes,
  isEmpty,
  isNull,
  isString,
  keys,
  memoize,
} from "lodash-es";
import React, { Suspense, useCallback } from "react";
import { twMerge } from "tailwind-merge";
import { inlineEditingActiveAtom } from "../../../atoms/ui.ts";
import { STYLES_KEY } from "../../../constants/STRINGS.ts";
import { canAcceptChildBlock } from "../../../functions/block-helpers.ts";
import { useCutBlockIds, useGlobalBlocksStore, useHiddenBlockIds, useLanguages } from "../../../hooks";
import { getSplitChaiClasses } from "../../../hooks/getSplitClasses.ts";
import { ChaiBlock } from "../../../types/ChaiBlock";
import { draggedBlockAtom, dropTargetBlockIdAtom } from "../dnd/atoms.ts";
import AsyncPropsBlock from "./AsyncPropsBlock.tsx";

const generateClassNames = memoize((styles: string) => {
  const { baseClasses, classes } = getSplitChaiClasses(styles);
  return twMerge(baseClasses, classes);
});

function getElementAttrs(block: ChaiBlock, key: string) {
  return get(block, `${key}_attrs`, {}) as Record<string, string>;
}

function getStyleAttrs(block: ChaiBlock) {
  const styles: Record<string, any> = {};
  Object.keys(block).forEach((key) => {
    if (isString(block[key]) && block[key].startsWith(STYLES_KEY)) {
      const className = generateClassNames(block[key]);
      const attrs = getElementAttrs(block, key);
      styles[key] = {
        className,
        "data-style-prop": key,
        "data-block-parent": block._id,
        "data-style-id": `${key}-${block._id}`,
        ...attrs,
      };
    }
  });
  return styles;
}

const getRuntimeProps = memoize((blockType: string) => {
  const chaiBlock = getRegisteredChaiBlock(blockType) as any;
  const props = get(chaiBlock, "schema.properties", {});
  // return key value with value has runtime: true
  return Object.fromEntries(Object.entries(props).filter(([, value]) => get(value, "runtime", false)));
});

function isDescendant(parentId: string, blockId: string, allBlocks: ChaiBlock[]): boolean {
  const parentBlock = find(allBlocks, { _id: parentId });
  if (!parentBlock) return false;

  const childBlocks = filter(allBlocks, { _parent: parentId });
  if (childBlocks.some((child) => child._id === blockId)) return true;

  return childBlocks.some((child) => isDescendant(child._id, blockId, allBlocks));
}

const RenderGlobalBlock = ({ blocks, allBlocks }: { blocks: ChaiBlock[]; allBlocks: ChaiBlock[] }) => {
  return <BlocksRendererStatic allBlocks={allBlocks} blocks={blocks} />;
};

function applyLanguage(_block: ChaiBlock, selectedLang: string, chaiBlock) {
  if (isEmpty(selectedLang)) return _block;

  const block = cloneDeep(_block);
  forEach(keys(block), (key) => {
    if (includes(get(chaiBlock, "i18nProps", []), key) && !isEmpty(selectedLang)) {
      block[key] = get(block, `${key}-${selectedLang}`, block[key]);
    }
  });
  return block;
}

export function BlocksRendererStatic({ blocks, allBlocks }: { blocks: ChaiBlock[]; allBlocks: ChaiBlock[] }) {
  const { selectedLang, fallbackLang } = useLanguages();
  const [cutBlockIds] = useCutBlockIds();
  const [draggedBlock] = useAtom<any>(draggedBlockAtom);
  const [dropTargetId] = useAtom(dropTargetBlockIdAtom);
  const [hiddenBlocks] = useHiddenBlockIds();
  const { getGlobalBlocks } = useGlobalBlocksStore();
  const getStyles = useCallback((block: ChaiBlock) => getStyleAttrs(block), []);

  const [editingBlockId] = useAtom(inlineEditingActiveAtom);
  const getRuntimePropValues = useCallback(
    (blockId: string, runtimeProps: Record<string, any>) => {
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
    },
    [allBlocks],
  );

  return (
    <>
      {React.Children.toArray(
        blocks.map((block: ChaiBlock, index: number) => {
          // If the block is being edited, we don't want to render it
          if (editingBlockId === block._id || hiddenBlocks.includes(block._id)) return null;
          const attrs: any = {};
          // if global block get the blocks from global blocks atom
          const childBlocks = filter(allBlocks, { _parent: block._id });

          attrs.children =
            childBlocks.length > 0 ? <BlocksRendererStatic allBlocks={allBlocks} blocks={childBlocks} /> : null;

          if (block._type === "GlobalBlock") {
            const blocks = getGlobalBlocks(block);
            attrs.children = (
              <RenderGlobalBlock blocks={filter(blocks, (block: ChaiBlock) => !block._parent)} allBlocks={blocks} />
            );
          }

          const chaiBlock = getRegisteredChaiBlock(block._type) as any;

          const Component = get(chaiBlock, "component", null);
          if (isNull(Component)) return <noscript>{`<!-- ${block?._type} not registered -->`}</noscript>;
          const htmlAttrs = getStyles(block);
          const isChildOfDraggedBlock = draggedBlock && isDescendant(draggedBlock._id, block._id, allBlocks);

          const blockProps = {
            "data-block-id": block._id,
            "data-block-type": block._type,
            ...(draggedBlock
              ? // @ts-ignore
                {
                  "data-dnd": canAcceptChildBlock(block._type, (draggedBlock as ChaiBlock)?._type) ? "yes" : "no",
                  "data-dnd-dragged":
                    (draggedBlock as ChaiBlock)._id === block._id || isChildOfDraggedBlock ? "yes" : "no",
                }
              : {}),
            ...(dropTargetId === block._id && !isChildOfDraggedBlock ? { "data-drop": "yes" } : {}),
            ...(includes(cutBlockIds, block._id) ? { "data-cut-block": "yes" } : {}),
          };

          const runtimeProps = getRuntimePropValues(block._id, getRuntimeProps(block._type));
          const props = {
            blockProps,
            index,
            ...applyLanguage(block, selectedLang, chaiBlock),
            ...htmlAttrs,
            ...attrs,
            ...runtimeProps,
            inBuilder: true,
            lang: selectedLang || fallbackLang,
          };

          if (has(chaiBlock, "dataProvider")) {
            return (
              <Suspense>
                <AsyncPropsBlock
                  lang={selectedLang || fallbackLang}
                  dataProvider={chaiBlock.dataProvider}
                  block={block}
                  component={Component}
                  props={props}
                />
              </Suspense>
            );
          }

          return <Suspense>{React.createElement(Component, props)}</Suspense>;
        }),
      )}
    </>
  );
}

import React, { Suspense, useCallback } from "react";
import {
  each,
  filter,
  find,
  get,
  has,
  includes,
  isEmpty,
  isNull,
  isString,
  memoize,
  omit,
  cloneDeep,
  forEach,
  keys,
} from "lodash-es";
import { twMerge } from "tailwind-merge";
import { ChaiBlock } from "../../../types/ChaiBlock";
import { STYLES_KEY } from "../../../constants/STRINGS.ts";
import { getBlockComponent } from "@chaibuilder/runtime";
import { useChaiExternalData } from "./useChaiExternalData.ts";
import { useAtom } from "jotai";
import { inlineEditingActiveAtom, xShowBlocksAtom } from "../../../atoms/ui.ts";
import { useCanvasSettings } from "../../../hooks/useCanvasSettings.ts";
import { draggedBlockAtom, dropTargetBlockIdAtom } from "../dnd/atoms.ts";
import { canAcceptChildBlock } from "../../../functions/block-helpers.ts";
import { useCanvasWidth, useCutBlockIds, useGlobalBlocksStore, useHiddenBlockIds, useLanguages } from "../../../hooks";
import { isVisibleAtBreakpoint } from "../../../functions/isVisibleAtBreakpoint.ts";
import { RSCBlock } from "./RSCBlock.tsx";

const generateClassNames = memoize((styles: string) => {
  const stylesArray = styles.replace(STYLES_KEY, "").split(",");
  return twMerge(stylesArray[0], stylesArray[1]);
});

function getElementAttrs(block: ChaiBlock, key: string) {
  return get(block, `${key}_attrs`, {}) as Record<string, string>;
}

function getStyleAttrs(block: ChaiBlock, breakpoint: any) {
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
      const alpineAttrs = has(attrs, "x-show") || has(attrs, "x-if");
      if (alpineAttrs) {
        styles["__isHidden"] = alpineAttrs && !isVisibleAtBreakpoint(className, breakpoint);
      }
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
    if (get(chaiBlock, ["props", key, "i18n"]) && !isEmpty(selectedLang)) {
      block[key] = get(block, `${key}-${selectedLang}`, block[key]);
    }
  });
  return block;
}

export function BlocksRendererStatic({ blocks, allBlocks }: { blocks: ChaiBlock[]; allBlocks: ChaiBlock[] }) {
  const { selectedLang } = useLanguages();
  const [xShowBlocks] = useAtom(xShowBlocksAtom);
  const [cutBlockIds] = useCutBlockIds();
  const [draggedBlock] = useAtom<any>(draggedBlockAtom);
  const [dropTargetId] = useAtom(dropTargetBlockIdAtom);
  const [, breakpoint] = useCanvasWidth();
  const [canvasSettings] = useCanvasSettings();
  const [hiddenBlocks] = useHiddenBlockIds();
  const { getGlobalBlocks } = useGlobalBlocksStore();
  const getStyles = useCallback((block: ChaiBlock) => getStyleAttrs(block, breakpoint), [breakpoint]);

  const [chaiData] = useChaiExternalData();
  const [editingBlockId] = useAtom(inlineEditingActiveAtom);
  const getCanvasSettings = useCallback(
    (blockIds: string[]) => {
      return blockIds.reduce((acc, blockId) => {
        const settings = get(canvasSettings, blockId, {});
        return { ...acc, ...settings };
      }, {});
    },
    [canvasSettings],
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

          const chaiBlock = getBlockComponent(block._type) as any;

          const isRSCBlock = get(chaiBlock, "server", false);
          const Component = isRSCBlock
            ? RSCBlock
            : get(chaiBlock, "builderComponent", get(chaiBlock, "component", null));
          if (isNull(Component)) return <noscript>{`<!-- ${block?._type} not registered -->`}</noscript>;
          const blockStateFrom = has(chaiBlock, "getBlockStateFrom")
            ? chaiBlock?.getBlockStateFrom(block, allBlocks)
            : [];
          const blockState = getCanvasSettings(blockStateFrom);
          const htmlAttrs = getStyles(block);
          if (get(htmlAttrs, "__isHidden", false) && !includes(xShowBlocks, block._id)) {
            return null;
          }
          const isChildOfDraggedBlock = draggedBlock && isDescendant(draggedBlock._id, block._id, allBlocks);

          const blockProps = {
            ...(includes(xShowBlocks, block._id) ? { "force-show": "" } : {}),
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
          if (isRSCBlock) {
            return <RSCBlock block={block} blockProps={blockProps} />;
          }

          return (
            <Suspense>
              {React.createElement(Component, {
                blockProps,
                index,
                ...applyBindings(applyLanguage(block, selectedLang, chaiBlock), chaiData),
                ...omit(htmlAttrs, ["__isHidden"]),
                ...attrs,
                inBuilder: true,
                blockState,
              })}
            </Suspense>
          );
        }),
      )}
    </>
  );
}

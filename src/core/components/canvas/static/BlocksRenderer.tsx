import React, { Suspense, useCallback } from "react";
import { each, filter, find, get, isEmpty, isNull, isString, memoize } from "lodash";
import { twMerge } from "tailwind-merge";
import { ChaiBlock } from "../../../types/ChaiBlock";
import { SLOT_KEY, STYLES_KEY } from "../../../constants/CONTROLS";
import { StylingAttributes } from "../../../types/index";
import { useAllBlocks, useHighlightBlockId } from "../../../hooks";
import { getBlockComponent } from "@chaibuilder/runtime";
import { useChaiExternalData } from "./useChaiExternalData.ts";
import { useAtom } from "jotai";
import { inlineEditingActiveAtom } from "../../../atoms/ui.ts";
import { canAddChildBlock } from "../../../functions/Layers.ts";

// FIXME:  Duplicate code in CanvasRenderer.tsx
const getSlots = (block: ChaiBlock) => {
  // loop over all keys and find the ones that start with slot
  const slots: { [key: string]: string[] } = {};
  Object.keys(block).forEach((key) => {
    if (isString(block[key]) && block[key].startsWith(SLOT_KEY)) {
      slots[key] = block[key].replace(SLOT_KEY, "").split(",");
    }
  });
  return slots;
};

const generateClassNames = memoize((styles: string) => {
  const stylesArray = styles.replace(STYLES_KEY, "").split(",");
  return twMerge(stylesArray[0], stylesArray[1]);
});

function getElementAttrs(block: ChaiBlock, key: string) {
  return get(block, `${key}_attrs`, {}) as Record<string, string>;
}

function getStyleAttrs(block: ChaiBlock, onMouseEnter: any, onMouseLeave: any) {
  const styles: { [key: string]: StylingAttributes } = {};
  Object.keys(block).forEach((key) => {
    if (isString(block[key]) && block[key].startsWith(STYLES_KEY)) {
      const styleName = generateClassNames(block[key]);
      styles[key] = {
        className: styleName,
        "data-style-prop": key,
        "data-block-parent": block._id,
        "data-style-id": `${key}-${block._id}`,
        onMouseEnter,
        onMouseLeave,
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

export function BlocksRendererStatic({ blocks }: { blocks: ChaiBlock[] }) {
  const allBlocks = useAllBlocks();
  const [, setHighlightedId] = useHighlightBlockId();
  const [editingBlockId] = useAtom(inlineEditingActiveAtom);

  const onMouseEnter = useCallback(
    (e: any) => {
      if (editingBlockId) return;
      const styleId: string | null = e.currentTarget?.getAttribute("data-style-id");
      setHighlightedId(styleId || "");
      e.stopPropagation();
    },
    [setHighlightedId, editingBlockId],
  );

  const onMouseLeave = useCallback(
    (e: any) => {
      if (editingBlockId) return;
      setHighlightedId("");
      e.stopPropagation();
    },
    [setHighlightedId, editingBlockId],
  );

  const getStyles = useCallback(
    (block: ChaiBlock) => getStyleAttrs(block, onMouseEnter, onMouseLeave),
    [onMouseEnter, onMouseLeave],
  );

  const [chaiData] = useChaiExternalData();

  return (
    <>
      {React.Children.toArray(
        blocks.map((block: ChaiBlock, index: number) => {
          const slots = getSlots(block);
          const attrs: any = {};
          if (!isEmpty(slots)) {
            Object.keys(slots).forEach((key) => {
              attrs[key] = React.Children.toArray(
                slots[key].map((slotId: string) => (
                  <BlocksRendererStatic blocks={[find(allBlocks, { _id: slotId }) as ChaiBlock]} />
                )),
              );
            });
          }
          const childBlocks = filter(allBlocks, { _parent: block._id });
          attrs.children = childBlocks.length ? <BlocksRendererStatic blocks={childBlocks} /> : null;

          const chaiBlock = getBlockComponent(block._type) as any;
          const Component = get(chaiBlock, "component", null);
          if (isNull(Component)) return <noscript>{`<!-- ${block?._type} not registered -->`}</noscript>;

          return (
            <Suspense>
              {React.createElement(Component, {
                "data-dnd": canAddChildBlock(block._type) ? "branch" : "leaf",
                blockProps: {
                  "data-block-id": block._id,
                  "data-block-type": block._type,
                },
                inBuilder: true,
                index,
                ...applyBindings(block, chaiData),
                ...getStyles(block),
                ...attrs,
              })}
            </Suspense>
          );
        }),
      )}
    </>
  );
}

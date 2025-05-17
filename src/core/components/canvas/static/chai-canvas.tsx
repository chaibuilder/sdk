import { inlineEditingActiveAtom, treeRefAtom } from "@/core/atoms/ui";
import { useFrame } from "@/core/frame";
import { useBlockHighlight, useSelectedBlockIds, useSelectedStylingBlocks } from "@/core/hooks";
import { useThrottledCallback } from "@react-hookz/web";
import { useAtom } from "jotai";
import { first, isEmpty } from "lodash-es";
import React, { useCallback, useEffect } from "react";

function getTargetedBlock(target) {
  // First check if the target is the canvas itself
  if (target.getAttribute("data-block-id") === "canvas") {
    return null;
  }

  // Then check for other blocks
  if (target.getAttribute("data-block-id") || target.getAttribute("data-block-parent")) {
    return target;
  }

  // When looking for parent blocks, exclude the canvas
  const closest = target.closest("[data-block-id]");
  return closest?.getAttribute("data-block-id") === "canvas" ? null : closest;
}

const useHandleCanvasClick = () => {
  const [, setStyleBlockIds] = useSelectedStylingBlocks();
  const [ids, setIds] = useSelectedBlockIds();
  const [editingBlockId] = useAtom(inlineEditingActiveAtom);
  const [treeRef] = useAtom(treeRefAtom);
  const { clearHighlight } = useBlockHighlight();
  return useCallback(
    (e: any) => {
      if (editingBlockId) return;
      e.stopPropagation();
      const chaiBlock: HTMLElement = getTargetedBlock(e.target);
      if (chaiBlock?.getAttribute("data-block-id") && chaiBlock?.getAttribute("data-block-id") === "container") {
        setIds([]);
        setStyleBlockIds([]);
        clearHighlight();
        return;
      }

      if (chaiBlock?.getAttribute("data-block-parent")) {
        // check if target element has data-styles-prop attribute
        const styleProp = chaiBlock.getAttribute("data-style-prop") as string;
        const styleId = chaiBlock.getAttribute("data-style-id") as string;
        const blockId = chaiBlock.getAttribute("data-block-parent") as string;
        if (!ids.includes(blockId)) {
          treeRef?.closeAll();
        }

        setStyleBlockIds([{ id: styleId, prop: styleProp, blockId }]);
        setIds([blockId]);
      } else if (chaiBlock?.getAttribute("data-block-id")) {
        const blockId = chaiBlock.getAttribute("data-block-id");
        if (!ids.includes(blockId)) {
          treeRef?.closeAll();
        }
        setStyleBlockIds([]);
        setIds(blockId === "canvas" ? [] : [blockId]);
      }

      clearHighlight();
    },
    [ids, treeRef, setIds, setStyleBlockIds],
  );
};

const useHandleMouseMove = () => {
  const [editingBlockId] = useAtom(inlineEditingActiveAtom);
  const { highlightBlock } = useBlockHighlight();

  return useThrottledCallback(
    (e: any) => {
      if (editingBlockId) return;
      const chaiBlock = getTargetedBlock(e.target);
      if (chaiBlock) {
        highlightBlock(chaiBlock);
      }
    },
    [editingBlockId, highlightBlock],
    20,
  );
};

const useHandleMouseLeave = () => {
  const { clearHighlight } = useBlockHighlight();
  return useCallback(() => clearHighlight(), [clearHighlight]);
};

export const StylingBlockSelectWatcher = () => {
  const [styleIds, setSelectedStylingBlocks] = useSelectedStylingBlocks();
  const { document } = useFrame();
  const { clearHighlight } = useBlockHighlight();
  const [ids] = useSelectedBlockIds();
  useEffect(() => {
    setTimeout(() => {
      if (!isEmpty(styleIds)) {
        return;
      }
      const element = getElementByDataBlockId(document, first(ids) as string);
      if (element) {
        const styleProp = element.getAttribute("data-style-prop") as string;
        if (styleProp) {
          const styleId = element.getAttribute("data-style-id") as string;
          const blockId = element.getAttribute("data-block-parent") as string;
          setSelectedStylingBlocks([{ id: styleId, prop: styleProp, blockId }]);
        }
      }
    }, 100);
  }, [document, ids, setSelectedStylingBlocks, styleIds]);
  // Add cleanup effect
  useEffect(() => {
    return () => clearHighlight();
  }, [clearHighlight]);
  return null;
};

export const Canvas = ({ children }: { children: React.ReactNode }) => {
  const handleCanvasClick = useHandleCanvasClick();
  const handleMouseMove = useHandleMouseMove();
  const handleMouseLeave = useHandleMouseLeave();

  console.log("children #1");
  return (
    <div
      data-block-id={"canvas"}
      id="canvas"
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative h-full max-w-full p-px`}>
      {children}
    </div>
  );
};

export const getElementByDataBlockId = (doc: any, blockId: string): HTMLElement =>
  doc.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement;

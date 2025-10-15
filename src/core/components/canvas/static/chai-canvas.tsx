import { CHAI_BUILDER_EVENTS } from "@/core/events";
import { useBlockHighlight, useInlineEditing } from "@/core/hooks";
import { pubsub } from "@/core/pubsub";
import { useThrottledCallback } from "@react-hookz/web";
import React, { useCallback, useRef } from "react";

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

const INLINE_EDITABLE_BLOCKS = ["Heading", "Paragraph", "Text", "Link", "Span", "Button"];

const isRichTextParent = (chaiBlock: HTMLElement | null): boolean => {
  return (
    chaiBlock?.getAttribute("data-block-type") === "RichText" ||
    chaiBlock?.parentElement?.getAttribute("data-block-type") === "RichText"
  );
};

/**
 *
 * @returns boolean indicating if the block type can be edited inline
 */
export const isInlineEditable = (chaiBlock: HTMLElement | null, _blockType?: string): boolean => {
  // If the block type is set, and the block is not null, return
  if (_blockType && chaiBlock) return;

  // If the block is a rich text parent, return false (CHANGE LATER)
  if (isRichTextParent(chaiBlock)) {
    return true;
  }

  // If the block type is not set, return false
  const blockType = _blockType || chaiBlock?.getAttribute("data-block-type");
  if (!blockType) return false;

  // If the block has children, return false
  return INLINE_EDITABLE_BLOCKS.includes(blockType);
};

const useHandleCanvasDblClick = () => {
  const { editingBlockId, setEditingBlockId, setEditingItemIndex } = useInlineEditing();

  return useCallback(
    (e) => {
      e?.preventDefault();
      e?.stopPropagation();
      if (editingBlockId) return;
      const chaiBlock: HTMLElement = getTargetedBlock(e.target);
      if (!isInlineEditable(chaiBlock)) return;

      const blockId = chaiBlock.getAttribute("data-block-id");
      if (!blockId || !chaiBlock) return;

      // * Checking for repeater items index
      const repeater = chaiBlock.closest('[data-block-type="Repeater"]');
      if (repeater) {
        repeater?.childNodes?.forEach((repeaterItem, key) => {
          if (repeaterItem.contains(chaiBlock)) {
            setEditingItemIndex(key);
          }
        });
      } else {
        setEditingItemIndex(-1);
      }

      setEditingBlockId(blockId);
    },
    [editingBlockId, setEditingBlockId, setEditingItemIndex],
  );
};

const useHandleCanvasClick = () => {
  const { editingBlockId } = useInlineEditing();
  const { clearHighlight } = useBlockHighlight();
  const lastClickTimeRef = useRef(0);

  return useCallback(
    (e: any) => {
      const currentTime = new Date().getTime();
      if (editingBlockId) return;
      e.stopPropagation();

      // Check for double click
      const isDoubleClick = currentTime - lastClickTimeRef.current < 400; // 400ms threshold for double click
      if (isDoubleClick) return;

      const chaiBlock: HTMLElement = getTargetedBlock(e.target);
      if (chaiBlock?.getAttribute("data-block-id") && chaiBlock?.getAttribute("data-block-id") === "container") {
        pubsub.publish(CHAI_BUILDER_EVENTS.CLEAR_CANVAS_SELECTION);
        return;
      }
      if (chaiBlock?.getAttribute("data-block-parent")) {
        // check if target element has data-styles-prop attribute
        const styleProp = chaiBlock.getAttribute("data-style-prop") as string;
        const styleId = chaiBlock.getAttribute("data-style-id") as string;
        const blockId = chaiBlock.getAttribute("data-block-parent") as string;
        pubsub.publish(CHAI_BUILDER_EVENTS.CANVAS_BLOCK_STYLE_SELECTED, { blockId, styleId, styleProp });
      } else if (chaiBlock?.getAttribute("data-block-id")) {
        const blockId = chaiBlock.getAttribute("data-block-id");
        pubsub.publish(CHAI_BUILDER_EVENTS.CANVAS_BLOCK_SELECTED, blockId === "canvas" ? [] : [blockId]);
      }
      clearHighlight();
      lastClickTimeRef.current = new Date().getTime();
    },
    [editingBlockId],
  );
};

const useHandleMouseMove = () => {
  const { editingBlockId } = useInlineEditing();
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
    100,
  );
};

const useHandleMouseLeave = () => {
  const { clearHighlight } = useBlockHighlight();
  return useCallback(() => clearHighlight(), [clearHighlight]);
};

export const Canvas = ({ children }: { children: React.ReactNode }) => {
  const handleDblClick = useHandleCanvasDblClick();
  const handleCanvasClick = useHandleCanvasClick();
  const handleMouseMove = useHandleMouseMove();
  const handleMouseLeave = useHandleMouseLeave();
  return (
    <div
      data-block-id={"canvas"}
      id="canvas"
      onClick={handleCanvasClick}
      onDoubleClick={handleDblClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative h-full max-w-full p-px`}>
      {children}
    </div>
  );
};

export const getElementByDataBlockId = (doc: any, blockId: string): HTMLElement =>
  doc.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement;

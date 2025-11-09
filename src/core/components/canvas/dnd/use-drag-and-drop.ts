import { CHAI_BUILDER_EVENTS } from "@/core/events";
import { canAcceptChildBlock } from "@/core/functions/block-helpers";
import { useAddBlock, useBlockHighlight, useSelectedBlockIds } from "@/core/hooks";
import { useCanvasIframe } from "@/core/hooks/use-canvas-iframe";
import { pubsub } from "@/core/pubsub";
import { ChaiBlock } from "@/types/common";
import { atom, useAtom } from "jotai";
import { isEmpty, pick } from "lodash";
import { throttle } from "lodash-es";
import { DragEvent, useCallback, useRef } from "react";
import { getOrientation } from "./getOrientation";

const dragAndDropAtom = atom<{ block: ChaiBlock | null; isAddNew: boolean }>({ block: null, isAddNew: true });

const getAttr = (element: HTMLElement, attr: string) => element && element.getAttribute(attr);

const getTargetParentElement = (element: HTMLElement) => {
  let parent = element.parentElement;
  while (parent && !getAttr(parent, "data-block-id")) parent = parent?.parentElement;
  return parent;
};

const getTargetDetail = (e: DragEvent) => {
  const element = e.target as HTMLElement;
  if (!element) return { targetBlockType: null, targetBlockId: null };
  const targetBlockId = getAttr(element, "data-block-id");
  if (!targetBlockId) return { targetBlockType: null, targetBlockId: null };
  const targetBlockType = getAttr(element, "data-block-type") || "Box";
  const targetParentElement = targetBlockId === "canvas" ? element : getTargetParentElement(element);
  const targetParentId = targetBlockId === "canvas" ? undefined : getAttr(targetParentElement, "data-block-id");
  const targetParentType = targetBlockId === "canvas" ? "Box" : getAttr(targetParentElement, "data-block-type");
  const orientation = getOrientation(targetParentElement);
  return {
    element,
    targetBlockType,
    targetBlockId,
    targetParentId,
    targetParentElement,
    orientation,
    targetParentType,
  };
};

/**
 *
 * On Drag Start
 */
const useBlockDragStart = () => {
  const [, setSelectedBlockIds] = useSelectedBlockIds();
  const { clearHighlight } = useBlockHighlight();
  const [, setBlock] = useAtom(dragAndDropAtom);
  const [iframeDoc] = useCanvasIframe();

  return useCallback(
    (e: DragEvent, _block: ChaiBlock, isAddNew: boolean = true) => {
      const block = (isAddNew ? pick(_block, ["type"]) : {}) as ChaiBlock;
      e.dataTransfer.setData("text/pl)ain", JSON.stringify({ block }));
      e.dataTransfer.setDragImage(new Image(), 0, 0);
      e.dataTransfer.effectAllowed = "move";
      setBlock({ block, isAddNew });
      setSelectedBlockIds([]);
      clearHighlight();
      pubsub.publish(CHAI_BUILDER_EVENTS.CLOSE_ADD_BLOCK);

      const iframeBody = (iframeDoc as HTMLIFrameElement)?.contentDocument?.body;
      const placeholderDiv = document.createElement("div");
      placeholderDiv.id = "chaibuilder-drag-placeholder";
      placeholderDiv.className = "sr-only absolute top-0 left-0 w-44 h-1 z-50 bg-red-500";
      iframeBody?.appendChild(placeholderDiv);
    },
    [setBlock, setSelectedBlockIds, clearHighlight, iframeDoc],
  );
};

/**
 *
 * On Drag Over
 */
const useBlockDragOver = () => {
  const [block] = useAtom(dragAndDropAtom);
  const [iframeDoc] = useCanvasIframe();
  const lastTargetRef = useRef<HTMLElement | null>(null);

  const throttledHandler = useCallback(
    throttle((e: DragEvent) => {
      const targetDetails = getTargetDetail(e);
      const { element, targetParentElement, targetParentType, orientation } = targetDetails;
      if (!targetParentElement) return;

      const canAddInThisParent = canAcceptChildBlock(targetParentType, block.block.type);
      if (!canAddInThisParent) return;

      if (lastTargetRef.current) {
        lastTargetRef.current.style.outline = "none";
      }

      targetParentElement.style.outline = "2px dashed green";
      lastTargetRef.current = targetParentElement;

      if (targetParentElement) {
        const document = (iframeDoc as HTMLIFrameElement)?.contentDocument;
        const dragPlaceholder = document?.getElementById("chaibuilder-drag-placeholder");
        dragPlaceholder.className = "absolute bg-green-500";
        const targetRect = element.getBoundingClientRect();
        const parentRect = targetParentElement.getBoundingClientRect();
        console.log("##", { orientation, parentRect, targetRect });
        if (orientation === "vertical") {
          dragPlaceholder.style.width = `${targetParentElement.clientWidth}px`;
          dragPlaceholder.style.height = "2px";
          dragPlaceholder.style.top = `${parentRect.top}px`;
          dragPlaceholder.style.left = `${targetRect.left}px`;
        } else {
          dragPlaceholder.style.width = "2px";
          dragPlaceholder.style.height = `${targetParentElement.clientHeight}px`;
          dragPlaceholder.style.top = `${targetRect.top}px`;
          dragPlaceholder.style.left = `${parentRect.left}px`;
          console.log("##", { parentRect, targetRect, element, targetParentElement });
        }
      }
    }, 300),
    [iframeDoc, block],
  );

  return useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      throttledHandler(e);
    },
    [throttledHandler, iframeDoc],
  );
};

/**
 *
 * On Drop
 */
const useBlockDrop = () => {
  const { addCoreBlock } = useAddBlock();
  const [iframeDoc] = useCanvasIframe();
  const [draggedBlock, setBlock] = useAtom(dragAndDropAtom);
  return useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const document = (iframeDoc as HTMLIFrameElement)?.contentDocument;
      const placeholders = document?.querySelectorAll("#chaibuilder-drag-placeholder");
      placeholders?.forEach((element) => element.remove());

      const { targetBlockId, targetParentId } = getTargetDetail(e);
      if (!targetBlockId) return;
      const { block, isAddNew } = draggedBlock;
      if (isAddNew) {
        console.log("##", { block, targetParentId });
        if (!isEmpty(block)) addCoreBlock(block, targetParentId);
      } else {
        // moveBlocks([block._id], targetBlockId);
      }

      setBlock({ block: null, isAddNew: false });
    },
    [draggedBlock, setBlock, iframeDoc],
  );
};

interface DragAndDrop {
  onDrag: (e: DragEvent, block: ChaiBlock) => void;
  onDragOver: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
  isDragging: boolean;
  draggedBlock: any;
}

export const useDragAndDrop = (): DragAndDrop => {
  const [draggedBlock] = useAtom(dragAndDropAtom);
  const onDrag = useBlockDragStart();
  const onDragOver = useBlockDragOver();
  const onDrop = useBlockDrop();
  const isDragging = draggedBlock !== null;
  return { onDrag, onDragOver, onDrop, isDragging, draggedBlock };
};

import { DragEvent, useEffect } from "react";
import { has, throttle } from "lodash-es";
import { useFrame } from "../../../frame";

import { useAtom } from "jotai";
import { draggingFlagAtom } from "../../../atoms/ui.ts";

import { useAddBlock, useHighlightBlockId, useSelectedBlockIds } from "../../../hooks";
import { useBlocksStoreUndoableActions } from "../../../history/useBlocksStoreUndoableActions.ts";
import { getOrientation } from "./getOrientation.ts";
import { draggedBlockAtom, dropTargetBlockIdAtom } from "./atoms.ts";
import { useFeature } from "flagged";
import { canAcceptChildBlock } from "../../../functions/block-helpers.ts";

let iframeDocument: null | HTMLDocument = null;
let possiblePositions: [number, number, number, number][] = [];
let dropTarget: HTMLElement | null = null;
let dropIndex: number | null = null;

const positionPlaceholder = (target: HTMLElement, orientation: "vertical" | "horizontal", mousePosition: number) => {
  if (!iframeDocument || !target) return;
  const placeholder = iframeDocument?.getElementById("placeholder") as HTMLElement;

  if (target?.id === "chaibuilder-canvas-blank-screen") {
    // * Block dropping placeholder for blank canvas
    placeholder.style.display = "block";
    placeholder.style.width = "100%";
    placeholder.style.height = "5px";
    placeholder.style.top = "0px";
    placeholder.style.left = "0px";
    return;
  }

  const positions = possiblePositions.map(([position]) => {
    return position;
  });

  const closest = positions.reduce(
    (prev, curr) => (Math.abs(curr - mousePosition) < Math.abs(prev - mousePosition) ? curr : prev),
    0,
  );

  const closestIndex = positions.indexOf(closest);
  if (!possiblePositions[closestIndex]) return;
  const values = possiblePositions[closestIndex];

  placeholder.style.width = orientation === "vertical" ? values[2] + "px" : "4px";
  placeholder.style.height = orientation === "vertical" ? "4px" : values[2] + "px";
  placeholder.style.display = "block";
  if (orientation === "vertical") {
    placeholder.style.top = values[0] - 1 + "px";
    placeholder.style.left = values[1] + "px";
  } else {
    placeholder.style.top = values[1] + "px";
    placeholder.style.left = values[0] - 1 + "px";
  }
};

function calculateDropIndex(mousePosition: number, possiblePositions: [number, number, number, number][]) {
  const positions = possiblePositions.map(([position]) => {
    return position;
  });

  const closest = positions.reduce(
    (prev, curr) => (Math.abs(curr - mousePosition) < Math.abs(prev - mousePosition) ? curr : prev),
    0,
  );

  const _closestIndex = positions.indexOf(closest);
  if (!possiblePositions[_closestIndex]) return 0;

  return possiblePositions[_closestIndex][3];
}

const calculatePossiblePositions = (target: HTMLElement) => {
  const orientation = getOrientation(target);
  const isHorizontal = orientation === "horizontal";

  possiblePositions = [];

  let blockIndex = 0;
  Array.from(target.children).forEach((child: HTMLElement) => {
    // * Skip elements with class 'pointer-events-none'
    if (child.classList.contains("pointer-events-none") || !child?.getAttribute("data-block-id")) return;

    const position = isHorizontal ? child.offsetLeft : child.offsetTop;
    const size = isHorizontal ? [child.offsetTop, child.clientHeight] : [child.offsetLeft, child.clientWidth];
    possiblePositions.push([position, size[0], size[1], blockIndex]);
    blockIndex++;
  });

  if (!isHorizontal) {
    if (target?.getAttribute("data-block-id") === "canvas") {
      // * Handle adding element at top of canvas if target is canvas
      if (target.children.length > 3) {
        const _offsetBottom = Array.from(target.children).reduce((acc, child) => acc + child.clientHeight, 0);
        possiblePositions.push([0, target.offsetLeft, target.clientWidth, 0]);
        possiblePositions.push([_offsetBottom, target.offsetLeft, target.clientWidth, blockIndex]);
      }
    } else {
      possiblePositions.push([
        target.offsetTop + target.clientHeight,
        target.offsetLeft,
        target.clientWidth,
        blockIndex,
      ]);
    }
  } else {
    if (target?.getAttribute("data-block-id") === "canvas") return;

    possiblePositions.push([target.offsetLeft + target.clientWidth, target.offsetTop, target.clientHeight, blockIndex]);
  }
};

const throttledDragOver = throttle((e: DragEvent) => {
  const target = e.target as HTMLElement;
  const orientation = getOrientation(target);

  if (target?.id === "chaibuilder-canvas-blank-screen") {
    positionPlaceholder(target, "vertical", 0);
    return;
  }

  const IframeScrollTop = iframeDocument?.defaultView?.scrollY;

  if (orientation === "vertical") {
    positionPlaceholder(target, orientation, e.clientY + IframeScrollTop);
  } else {
    positionPlaceholder(target, orientation, e.clientX);
  }
}, 0);

function removePlaceholder() {
  const placeholder = iframeDocument?.getElementById("placeholder") as HTMLElement;
  placeholder.style.display = "none";
  removeClassFromElements("pointer-none");
  removeDataDrop();
}

function removeClassFromElements(className: string): void {
  const elements = iframeDocument?.querySelectorAll(`.${className}`);
  elements.forEach((element) => {
    element.classList.remove(className);
  });
}

function removeDataDrop(): void {
  const element = iframeDocument?.querySelector('[data-drop="yes"]');
  if (element) {
    element.removeAttribute("data-drop");
  }
}

function canDropInTarget(target, draggedBlock) {
  if (!target || !draggedBlock) return;

  const dragBlockType = draggedBlock?.type;
  const dropBlockType = target?.getAttribute("data-block-type");
  return canAcceptChildBlock(dropBlockType, dragBlockType);
}

export const useDnd = () => {
  const { document } = useFrame();
  const [isDragging, setIsDragging] = useAtom(draggingFlagAtom);
  const { addCoreBlock } = useAddBlock();

  const [, setHighlight] = useHighlightBlockId();
  const [, setBlockIds] = useSelectedBlockIds();
  const { moveBlocks } = useBlocksStoreUndoableActions();
  const [draggedBlock, setDraggedBlock] = useAtom(draggedBlockAtom);
  const [, setDropTarget] = useAtom(dropTargetBlockIdAtom);
  const dnd = useFeature("dnd");

  const resetDragState = () => {
    removePlaceholder();
    setIsDragging(false);
    //@ts-ignore
    setDraggedBlock(null);
    //@ts-ignore
    setDropTarget(null);
    possiblePositions = [];
    dropTarget = null;
    dropIndex = null;
  };

  useEffect(() => {
    // * Handling dropping block outside of canvas
    const rootLayout = window.document.getElementById("chaibuilder-root-layout-container");
    const handleOutsideDrop = (e) => {
      e.preventDefault();
      resetDragState();
    };
    rootLayout?.addEventListener("drop", handleOutsideDrop);
    return () => rootLayout?.removeEventListener("drop", handleOutsideDrop);
  }, []);

  if (!dnd) return {};

  iframeDocument = document as HTMLDocument;
  return {
    isDragging,
    onDragOver: (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (canDropInTarget(dropTarget, draggedBlock)) {
        throttledDragOver(e);
      }
    },
    onDrop: (ev: DragEvent) => {
      if (dropTarget?.id === "chaibuilder-canvas-blank-screen") {
        // * Handle first drop on blank canvas
        addCoreBlock(draggedBlock, null);
        resetDragState();
        return;
      }

      const block = dropTarget as HTMLElement;
      const orientation = getOrientation(block);
      const mousePosition = orientation === "vertical" ? ev.clientY + iframeDocument?.defaultView?.scrollY : ev.clientX;
      dropIndex = calculateDropIndex(mousePosition, possiblePositions);
      const data = draggedBlock;
      const id = block.getAttribute("data-block-id");

      const isDropTargetAllowed = dropTarget.getAttribute("data-dnd-dragged") === "yes" ? false : true;

      //if the draggedItem is the same as the dropTarget, reset the drag state.
      if (data?._id === id || !isDropTargetAllowed || !canDropInTarget(dropTarget, draggedBlock)) {
        resetDragState();
        return;
      }

      // This is for moving blocks from the sidebar Panel and UiLibraryPanel
      if (!has(data, "_id")) {
        addCoreBlock(data, id === "canvas" ? null : id, dropIndex);
        setTimeout(resetDragState, 300);
        return;
      }

      // get the block id from the attribute data-block-id from target
      let blockId = block.getAttribute("data-block-id");

      if (blockId === null) {
        const parent = (ev.target as HTMLElement).parentElement;
        blockId = parent.getAttribute("data-block-id");
      }

      //@ts-ignore
      moveBlocks([data._id], blockId === "canvas" ? null : blockId, dropIndex);
      resetDragState();
      setTimeout(removePlaceholder, 300);
    },
    onDragEnter: (e: DragEvent) => {
      const event = e;
      const target = event.target as HTMLElement;
      dropTarget = target;
      const dropTargetId = target.getAttribute("data-block-id");
      const isdropTargetAllowed = target.getAttribute("data-dnd-dragged") === "yes" ? false : true;

      //@ts-ignore
      setDropTarget(dropTargetId);
      event.stopPropagation();
      event.preventDefault();
      possiblePositions = [];
      if (isdropTargetAllowed && canDropInTarget(target, draggedBlock)) {
        calculatePossiblePositions(target);
      }
      setIsDragging(true);
      setHighlight("");
      setBlockIds([]);
    },
    onDragLeave: (e) => {
      const dropTargetId = e.target.getAttribute("data-block-id");
      if ("canvas" !== dropTargetId) return;
      //@ts-ignore
      setDropTarget(null);
      setIsDragging(false);
      removePlaceholder();
      possiblePositions = [];
    },
  };
};

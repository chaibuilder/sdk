import { DragEvent } from "react";
import { throttle } from "lodash-es";
import { useFrame } from "../../../frame";

import { useAtom } from "jotai";
import { draggedBlockIdAtom, draggingFlagAtom } from "../../../atoms/ui.ts";
import { useAddBlock, useHighlightBlockId, useSelectedBlockIds } from "../../../hooks";
import { useBlocksStoreUndoableActions } from "../../../history/useBlocksStoreUndoableActions.ts";
import { has } from "lodash";
import { getOrientation } from "./getOrientation.ts";
import { draggedBlockAtom } from "./atoms.ts";
import { canAcceptChildBlock } from "../../../functions/block-helpers.ts";

let iframeDocument: null | HTMLDocument = null;
let possiblePositions: number[] = [];
let dropTarget: HTMLElement | null = null;
let dropIndex: number | null = null;

function getPadding(target: HTMLElement) {
  const style = window.getComputedStyle(target);
  const paddingLeft = parseInt(style.paddingLeft, 10) as number;
  const paddingTop = parseInt(style.paddingTop, 10) as number;
  const paddingRight = parseInt(style.paddingRight, 10) as number;
  const paddingBottom = parseInt(style.paddingBottom, 10) as number;
  return { paddingLeft, paddingTop, paddingRight, paddingBottom };
}

const positionPlaceholder = (target: HTMLElement, orientation: "vertical" | "horizontal", mousePosition: number) => {
  if (!iframeDocument) return;
  const targetRect = target.getBoundingClientRect();
  const placeholder = iframeDocument?.getElementById("placeholder") as HTMLElement;

  // get padding of the target element
  const { paddingLeft, paddingTop, paddingRight, paddingBottom } = getPadding(target);

  placeholder.style.width = orientation === "vertical" ? targetRect.width - paddingLeft - paddingRight + "px" : "2px";
  placeholder.style.height = orientation === "vertical" ? "2px" : targetRect.height - paddingTop - paddingBottom + "px";
  placeholder.style.display = "block";

  const closest = possiblePositions.reduce(
    (prev, curr) => (Math.abs(curr - mousePosition) < Math.abs(prev - mousePosition) ? curr : prev),
    0,
  );

  if (orientation === "vertical") {
    placeholder.style.top = target.offsetTop + closest + "px";
    placeholder.style.left = target.offsetLeft + paddingLeft + "px";
  } else {
    placeholder.style.top = target.offsetTop + paddingTop + "px";
    placeholder.style.left = target.offsetLeft + closest + "px";
  }
};

function calculateDropIndex(mousePosition: number, positions: number[]) {
  let closestIndex = 0;
  let closestDistance = Infinity;
  positions.forEach((position, index) => {
    const distance = Math.abs(position - mousePosition);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
}

const calculatePossiblePositions = (target: HTMLElement) => {
  const orientation = getOrientation(target);
  const style = window.getComputedStyle(target);
  const isHorizontal = orientation === "horizontal";

  // Get padding values
  const paddingLeft = parseInt(style.paddingLeft);
  const paddingTop = parseInt(style.paddingTop);

  // Calculate positions based on child elements and their margins
  let currentPosition = isHorizontal ? paddingLeft : paddingTop;
  possiblePositions = [currentPosition];

  Array.from(target.children).forEach((child: HTMLElement) => {
    const position = isHorizontal ? child.offsetLeft : child.offsetTop;
    // First child, consider starting position with its margin
    possiblePositions.push(position);
    // Move the current position across this child
  });
};

const throttledDragOver = throttle((e: DragEvent) => {
  const target = e.target as HTMLElement;
  const orientation = getOrientation(target);
  if (orientation === "vertical") {
    const y = e.clientY - target.offsetTop;
    positionPlaceholder(target, orientation, y);
  } else {
    const x = e.clientX - target.offsetLeft;
    positionPlaceholder(target, orientation, x);
  }
}, 200);

function removePlaceholder() {
  const placeholder = iframeDocument?.getElementById("placeholder") as HTMLElement;
  placeholder.style.display = "none";
}

export const useDnd = () => {
  const { document } = useFrame();
  const [isDragging, setIsDragging] = useAtom(draggingFlagAtom);
  const { addCoreBlock } = useAddBlock();
  const [, setHighlight] = useHighlightBlockId();
  const [, setBlockIds] = useSelectedBlockIds();
  const { moveBlocks } = useBlocksStoreUndoableActions();
  const [, setDraggedBlockId] = useAtom(draggedBlockIdAtom);
  const [draggedBlock] = useAtom(draggedBlockAtom);

  iframeDocument = document as HTMLDocument;
  return {
    isDragging,
    onDragOver: (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      throttledDragOver(e);
    },
    onDrop: (ev: DragEvent) => {
      dropTarget?.classList.remove("drop-target");
      const block = dropTarget as HTMLElement;
      console.log("block", block);
      const orientation = getOrientation(block);
      const mousePosition = orientation === "vertical" ? ev.clientY : ev.clientX;
      dropIndex = calculateDropIndex(mousePosition, possiblePositions);
      const data = draggedBlock;
      const id = block.getAttribute("data-block-id");
      if (!has(data, "_id")) {
        addCoreBlock(data, id === "canvas" ? null : id, dropIndex);
        setTimeout(() => {
          removePlaceholder();
        }, 300);
        return;
      }

      // get the block id from the attribute data-block-id from target

      let blockId = block.getAttribute("data-block-id");

      if (blockId === null) {
        const parent = (ev.target as HTMLElement).parentElement;
        blockId = parent.getAttribute("data-block-id");
      }

      moveBlocks([data._id], blockId, dropIndex);
      removePlaceholder();
      setIsDragging(false);
      setDraggedBlockId("");
      setTimeout(() => {
        removePlaceholder();
      }, 300);
    },
    onDragEnter: (e: DragEvent) => {
      const type = draggedBlock?.type || draggedBlock?._type;
      const event = e;
      const target = event.target as HTMLElement;
      const dropTargetType = target.getAttribute("data-block-type");

      if (!canAcceptChildBlock(dropTargetType, type)) return;

      dropTarget = target;
      event.stopPropagation();
      event.preventDefault();
      possiblePositions = [];
      calculatePossiblePositions(target);
      target.classList.add("drop-target");
      setIsDragging(true);
      setHighlight("");
      setBlockIds([]);
    },
    // onDragLeave: (e: DragEvent) => {
    //   const event = e;
    //   dropTarget = null;
    //   event.stopPropagation();
    //   event.preventDefault();
    //   const target = event.target as HTMLElement;
    //   target.classList.remove("drop-target");
    // },
  };
};

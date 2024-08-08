import { DragEvent } from "react";
import { noop, throttle, find, first } from "lodash-es";
import { useFrame } from "../../../frame";

import { useAtom } from "jotai";
import { draggedBlockIdAtom, draggingFlagAtom } from "../../../atoms/ui.ts";
import { useFeature } from "flagged";
import { useHighlightBlockId, useSelectedBlockIds } from "../../../hooks";
import { useBlocksStore, useBlocksStoreUndoableActions } from "../../../history/useBlocksStoreUndoableActions.ts";

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

  const closest = possiblePositions.reduce((prev, curr) =>
    Math.abs(curr - mousePosition) < Math.abs(prev - mousePosition) ? curr : prev,
  );

  if (orientation === "vertical") {
    placeholder.style.top = target.offsetTop + closest + "px";
    placeholder.style.left = target.offsetLeft + paddingLeft + "px";
  } else {
    placeholder.style.top = target.offsetTop + paddingTop + "px";
    placeholder.style.left = target.offsetLeft + closest + "px";
  }
};

function calculateDropIndex(
  target: HTMLElement,
  mousePosition: number,
  orientation: "vertical" | "horizontal",
  blocks: any,
) {
  const targetBlockId = target.getAttribute("data-block-id");
  if (!targetBlockId) return null;

  const targetBlock = blocks.find((block) => block._id === targetBlockId);
  if (!targetBlock) return null;

  // Get all siblings within the same parent
  const parentBlockId = targetBlock._parent;
  const siblingBlocks = blocks.filter((block) => block._parent === parentBlockId);

  // Gather positions of all sibling blocks
  const siblingPositions: number[] = [];
  siblingBlocks.forEach((block) => {
    const blockElement = document.querySelector(`[data-block-id="${block._id}"]`) as HTMLElement;
    if (blockElement) {
      const position = orientation === "vertical" ? blockElement.offsetTop : blockElement.offsetLeft;
      siblingPositions.push(position);
    }
  });

  let closestIndex = 0;
  let closestDistance = Infinity;
  siblingPositions.forEach((position, index) => {
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
    const childStyle = window.getComputedStyle(child);
    const childMarginBefore = parseInt(
      isHorizontal ? childStyle.marginLeft + childStyle.marginRight : childStyle.marginTop + childStyle.marginBottom,
    );
    const childDimension = isHorizontal ? child.offsetWidth : child.offsetHeight;
    // First child, consider starting position with its margin
    possiblePositions.push(currentPosition + childDimension + childMarginBefore);
    // Move the current position across this child
    currentPosition += childDimension + childMarginBefore;
  });
};

function getOrientation(target: HTMLElement) {
  const display = window.getComputedStyle(target).display;
  const flexDirection = window.getComputedStyle(target).flexDirection;

  if (display === "flex") {
    if (flexDirection === "column" || flexDirection === "column-reverse") {
      return "vertical";
    } else {
      return "horizontal";
    }
  } else if (display === "grid") {
    const gridTemplateRows = window.getComputedStyle(target).gridTemplateRows;
    const gridTemplateColumns = window.getComputedStyle(target).gridTemplateColumns;

    if (gridTemplateRows.includes("auto")) {
      return "vertical";
    } else if (gridTemplateColumns.includes("auto")) {
      return "horizontal";
    }
  } else if (display === "inline-block") {
    return "vertical";
  }

  return display === "block" ? "vertical" : "horizontal";
}

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

// const useCanMove = () => {
//   const [blocks] = useBlocksStore();
//   return (ids: string[], newParentId: string | null) => {
//     const newParentType = find(blocks, { _id: newParentId })?._type;
//     const blockType = first(ids.map((id) => find(blocks, { _id: id })?._type));
//     return canAcceptChildBlock(newParentType, blockType);
//   };
// };

export const useDnd = () => {
  const { document } = useFrame();
  const [isDragging, setIsDragging] = useAtom(draggingFlagAtom);

  const dndEnabled = useFeature("dnd");
  const [, setHighlight] = useHighlightBlockId();
  const [, setBlockIds] = useSelectedBlockIds();
  const { moveBlocks } = useBlocksStoreUndoableActions();
  // const canMove = useCanMove();
  const [blocks] = useBlocksStore();
  const [, setDraggedBlockId] = useAtom(draggedBlockIdAtom);

  iframeDocument = document as HTMLDocument;
  return {
    isDragging,
    "data-dnd": "branch",
    onDragOver: (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      throttledDragOver(e);
    },
    onDrop: !dndEnabled
      ? noop
      : (ev: DragEvent) => {
          dropTarget?.classList.remove(
            "outline-dashed",
            "outline-orange-300",
            "outline-2",
            "-outline-offset-2",
            "bg-orange-300/30",
          );
          const data: { _id: string } = JSON.parse(ev.dataTransfer.getData("text/plain") as string);
          // get the block id from the attribute data-block-id from target
          const block = ev.target as HTMLElement;
          let blockId = block.getAttribute("data-block-id");

          if (blockId === null) {
            const parent = (ev.target as HTMLElement).parentElement;
            blockId = parent.getAttribute("data-block-id");
          }

          const orientation = getOrientation(block);
          const mousePosition = orientation === "vertical" ? ev.clientY : ev.clientX;

          dropIndex = calculateDropIndex(block, mousePosition, orientation, blocks);

          moveBlocks([data._id], blockId, dropIndex);

          removePlaceholder();
          setIsDragging(false);
          setDraggedBlockId("");
          setTimeout(() => {
            removePlaceholder();
          }, 300);
        },
    onDragEnter: !dndEnabled
      ? noop
      : (e: DragEvent) => {
          const event = e;
          dropTarget = event.target as HTMLElement;
          event.stopPropagation();
          event.preventDefault();
          possiblePositions = [];
          const target = event.target as HTMLElement;
          calculatePossiblePositions(target);
          target.classList.add(
            "outline-dashed",
            "outline-orange-300",
            "outline-2",
            "-outline-offset-2",
            "bg-orange-300/30",
          );

          setIsDragging(true);
          setHighlight("");
          setBlockIds([]);
        },
    onDragLeave: !dndEnabled
      ? noop
      : (e: DragEvent) => {
          const event = e;
          dropTarget = null;
          event.stopPropagation();
          event.preventDefault();
          const target = event.target as HTMLElement;
          target.classList.remove(
            "outline-dashed",
            "outline-orange-300",
            "outline-2",
            "-outline-offset-2",
            "bg-orange-300/30",
          );
        },
    onMouseOut: !dndEnabled
      ? noop
      : () => {
          setIsDragging(false);
          removePlaceholder();
          setDraggedBlockId("");
        },
  };
};

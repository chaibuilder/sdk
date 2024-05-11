import { DragEvent } from "react";
import { noop, throttle } from "lodash-es";
import { useFrame } from "../../../frame";
import { useAddBlockByDrop } from "../../../hooks/useAddBlockByDrop.ts";
import { useAtom } from "jotai";
import { draggingFlagAtom } from "../../../atoms/ui.ts";
import { useFeature } from "flagged";
import { useHighlightBlockId, useSelectedBlockIds } from "../../../hooks";

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
  dropIndex = possiblePositions.indexOf(closest);
  if (orientation === "vertical") {
    placeholder.style.top = target.offsetTop + closest + "px";
    placeholder.style.left = target.offsetLeft + paddingLeft + "px";
  } else {
    placeholder.style.top = target.offsetTop + paddingTop + "px";
    placeholder.style.left = target.offsetLeft + closest + "px";
  }
};

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

const dragOver = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  throttledDragOver(e);
};

function removePlaceholder() {
  const placeholder = iframeDocument?.getElementById("placeholder") as HTMLElement;
  placeholder.style.display = "none";
}

export const useDnd = () => {
  const { document } = useFrame();
  const [isDragging, setIsDragging] = useAtom(draggingFlagAtom);
  const addOnDrop = useAddBlockByDrop();
  const dndEnabled = useFeature("dnd");
  const [, setHighlight] = useHighlightBlockId();
  const [, setBlockIds] = useSelectedBlockIds();
  iframeDocument = document as HTMLDocument;
  return {
    isDragging,
    "data-dnd": "branch",
    onDragOver: dndEnabled ? dragOver : noop,
    onDrop: !dndEnabled
      ? noop
      : (ev: DragEvent) => {
          dropTarget?.classList.remove("outline", "outline-green-300", "outline-2", "-outline-offset-2");
          const data: string = JSON.parse(ev.dataTransfer.getData("text/plain") as string);
          // get the block id from the attribute data-block-id from target
          let blockId = (ev.target as HTMLElement).getAttribute("data-block-id");
          if (blockId === null) {
            const parent = (ev.target as HTMLElement).parentElement;
            blockId = parent.getAttribute("data-block-id");
          }

          addOnDrop({ block: data, dropTargetId: blockId || null, relativeIndex: dropIndex });
          setIsDragging(false);
          removePlaceholder();
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
          target.classList.add("outline", "outline-green-300", "outline-2", "-outline-offset-2");
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
          target.classList.remove("outline", "outline-green-300", "outline-2", "-outline-offset-2");
        },
    onMouseOut: !dndEnabled
      ? noop
      : () => {
          setIsDragging(false);
          removePlaceholder();
        },
  };
};

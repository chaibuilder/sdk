import { DragEvent } from "react";
import { has, throttle } from "lodash-es";
import { useFrame } from "../../../frame";

import { useAtom } from "jotai";
import { draggedBlockIdAtom, draggingFlagAtom } from "../../../atoms/ui.ts";
import { useAddBlock, useHighlightBlockId, useSelectedBlockIds } from "../../../hooks";
import { useBlocksStoreUndoableActions } from "../../../history/useBlocksStoreUndoableActions.ts";
import { getOrientation } from "./getOrientation.ts";
import { draggedBlockAtom, dropTargetAtom } from "./atoms.ts";

let iframeDocument: null | HTMLDocument = null;
let possiblePositions: [number, number, number][] = [];
let dropTarget: HTMLElement | null = null;
let dropIndex: number | null = null;

function getPadding(target: HTMLElement) {
  if (!target) return { paddingLeft: 0, paddingTop: 0, paddingRight: 0, paddingBottom: 0 };
  const style = window.getComputedStyle(target);
  const paddingLeft = parseInt(style.paddingLeft, 10) as number;
  const paddingTop = parseInt(style.paddingTop, 10) as number;
  const paddingRight = parseInt(style.paddingRight, 10) as number;
  const paddingBottom = parseInt(style.paddingBottom, 10) as number;
  return { paddingLeft, paddingTop, paddingRight, paddingBottom };
}

const positionPlaceholder = (target: HTMLElement, orientation: "vertical" | "horizontal", mousePosition: number) => {
  if (!iframeDocument || !target) return;
  const placeholder = iframeDocument?.getElementById("placeholder") as HTMLElement;

  const positions = possiblePositions.map(([position]) => {
    return position;
  });
  const closest = positions.reduce(
    (prev, curr) => (Math.abs(curr - mousePosition) < Math.abs(prev - mousePosition) ? curr : prev),
    0,
  );
  if (!possiblePositions[closest]) return;
  const values = possiblePositions[closest];
  placeholder.style.width = orientation === "vertical" ? values[2] + "px" : "2px";
  placeholder.style.height = orientation === "vertical" ? "2px" : values[2] + "px";
  placeholder.style.display = "block";
  if (orientation === "vertical") {
    placeholder.style.top = values[0] + "px";
    placeholder.style.left = values[1] + "px";
  } else {
    placeholder.style.top = values[1] + "px";
    placeholder.style.left = values[0] + "px";
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
  const isHorizontal = orientation === "horizontal";

  // Calculate positions based on child elements and their margins
  possiblePositions = [];
  Array.from(target.children).forEach((child: HTMLElement) => {
    // if has class pointer-none, skip
    if (child.classList.contains("pointer-events-none")) return;
    const position = isHorizontal ? child.offsetLeft : child.offsetTop;
    // First child, consider starting position with its margin
    const size = isHorizontal ? [child.offsetTop, child.clientHeight] : [child.offsetLeft, child.clientWidth];
    possiblePositions.push([position, size[0], size[1]]);
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
  removeClassFromElements("pointer-none");
}

function removeClassFromElements(className: string): void {
  const elements = document.querySelectorAll(`.${className}`);
  elements.forEach((element) => {
    element.classList.remove(className);
  });
}

export const useDnd = () => {
  const { document } = useFrame();
  const [isDragging, setIsDragging] = useAtom(draggingFlagAtom);
  const { addCoreBlock } = useAddBlock();
  const [, setHighlight] = useHighlightBlockId();
  const [, setBlockIds] = useSelectedBlockIds();
  const { moveBlocks } = useBlocksStoreUndoableActions();
  const [, setDraggedBlockId] = useAtom(draggedBlockIdAtom);
  const [draggedBlock, setDraggedBlock] = useAtom(draggedBlockAtom);
  const [, setDropTarget] = useAtom(dropTargetAtom);

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
        possiblePositions = [];
        setIsDragging(false);
        setDraggedBlockId("");
        //@ts-ignore
        setDraggedBlock(null);
        //@ts-ignore
        setDropTarget(null);
        return;
      }

      // get the block id from the attribute data-block-id from target

      let blockId = block.getAttribute("data-block-id");

      if (blockId === null) {
        const parent = (ev.target as HTMLElement).parentElement;
        blockId = parent.getAttribute("data-block-id");
      }

      //@ts-ignore
      moveBlocks([data._id], blockId, dropIndex);
      removePlaceholder();
      setIsDragging(false);
      setDraggedBlockId("");
      setTimeout(() => removePlaceholder(), 300);
    },
    onDragEnter: (e: DragEvent) => {
      const event = e;
      const target = event.target as HTMLElement;
      dropTarget = target;
      const dropTargetId = target.getAttribute("data-block-id");
      //@ts-ignore
      setDropTarget(dropTargetId);
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

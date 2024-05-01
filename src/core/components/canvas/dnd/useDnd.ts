import { DragEvent } from "react";
import { noop, throttle } from "lodash";
import { useFrame } from "../../../frame";
import { useAddBlockByDrop } from "../../../hooks/useAddBlockByDrop.ts";
import { useAtom } from "jotai";
import { draggingFlagAtom } from "../../../atoms/ui.ts";
import { useFeature } from "flagged";

let iframeDocument: null | HTMLDocument = null;
let possiblePositions: number[] = [];
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
  placeholder.style.height = orientation === "vertical" ? "5px" : targetRect.height - paddingTop - paddingBottom + "px";
  placeholder.style.display = "block";

  const closest = possiblePositions.reduce((prev, curr) =>
    Math.abs(curr - mousePosition) < Math.abs(prev - mousePosition) ? curr : prev,
  );
  dropIndex = possiblePositions.indexOf(closest);
  placeholder.style.top = target.offsetTop + (orientation === "vertical" ? closest : 0) + "px";
  placeholder.style.left = target.offsetLeft + (orientation === "horizontal" ? closest : 0) + "px";
};

const calculatePossiblePositions = (target: HTMLElement) => {
  const orientation = getOrientation(target);
  const targetRect = target.getBoundingClientRect();
  const children = Array.from(target.children) as HTMLElement[];
  // filter out the elements with data-dnd="ignore"
  children.filter((child) => child.getAttribute("data-dnd") !== "ignore");
  const { paddingLeft, paddingTop } = getPadding(target);

  possiblePositions = [orientation === "vertical" ? paddingLeft : paddingTop];

  possiblePositions = [
    ...possiblePositions,
    ...children.map((child) => {
      const childRect = child.getBoundingClientRect();
      return orientation === "vertical"
        ? childRect.top - targetRect.top + childRect.height
        : childRect.left - targetRect.left + childRect.width;
    }),
  ];
};

function getOrientation(target: HTMLElement) {
  const display = window.getComputedStyle(target).display;
  const orientation: "vertical" | "horizontal" = display === "block" ? "vertical" : "horizontal";
  return display === "flex" && target.style.flexDirection === "column" ? "vertical" : orientation;
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
  iframeDocument = document as HTMLDocument;
  return {
    isDragging,
    "data-dnd": "branch",
    onDragOver: dndEnabled ? dragOver : noop,
    onDrop: !dndEnabled
      ? noop
      : (ev: DragEvent) => {
          const data: string = JSON.parse(ev.dataTransfer.getData("text/plain") as string);
          // get the block id from the attribute data-block-id from target
          let blockId = (ev.target as HTMLElement).getAttribute("data-block-id");
          if (blockId === null) {
            const parent = (ev.target as HTMLElement).parentElement;
            blockId = parent.getAttribute("data-block-id");
          }

          addOnDrop({ block: data, dropTargetId: blockId || null, relativeIndex: dropIndex });
          setIsDragging(false);
          setTimeout(() => removePlaceholder(), 300);
        },
    onDragEnter: !dndEnabled
      ? noop
      : (e: DragEvent) => {
          const event = e;
          event.stopPropagation();
          event.preventDefault();
          possiblePositions = [];
          const target = event.target as HTMLElement;
          calculatePossiblePositions(target);
          target.classList.add("outline", "outline-blue-500", "outline-4", "-outline-offset-4");
          setIsDragging(true);
        },
    onDragLeave: !dndEnabled
      ? noop
      : (e: DragEvent) => {
          const event = e;
          event.stopPropagation();
          event.preventDefault();
          const target = event.target as HTMLElement;
          target.classList.remove("outline", "outline-blue-500", "outline-4", "-outline-offset-4");
        },
    onMouseOut: !dndEnabled
      ? noop
      : () => {
          setIsDragging(false);
          removePlaceholder();
        },
  };
};

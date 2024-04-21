import { DragEvent, useState } from "react";
import { throttle } from "lodash";
import { useFrame } from "../../../frame";
import { useAddBlockByDrop } from "../../../hooks/useAddBlockByDrop.ts";

let iframeDocument: null | HTMLDocument = null;
let possiblePositions: number[] = [];
let dropIndex: number | null = null;

const positionPlaceholder = (target: HTMLElement, orientation: "vertical" | "horizontal", mousePosition: number) => {
  if (!iframeDocument) return;
  const targetRect = target.getBoundingClientRect();
  const placeholder = iframeDocument?.getElementById("placeholder") as HTMLElement;
  placeholder.style.width = orientation === "vertical" ? targetRect.width + "px" : "2px";
  placeholder.style.height = orientation === "vertical" ? "5px" : targetRect.height + "px";
  placeholder.style.backgroundColor = "red";
  placeholder.style.opacity = "0.5";
  placeholder.style.position = "absolute";
  placeholder.style.zIndex = "99999";
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
  possiblePositions = [0];

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
  const [isDragging, setIsDragging] = useState(false);
  const addOnDrop = useAddBlockByDrop();
  iframeDocument = document as HTMLDocument;
  return {
    isDragging,
    "data-dnd": "branch",
    onDragOver: dragOver,
    onDrop: (ev: DragEvent) => {
      const data: string = JSON.parse(ev.dataTransfer.getData("text/plain") as string);
      addOnDrop({ block: data, dropTargetId: null, relativeIndex: dropIndex });
      setIsDragging(false);
      removePlaceholder();
    },
    onDragEnter: (e: DragEvent) => {
      const event = e;
      event.stopPropagation();
      event.preventDefault();
      possiblePositions = [];
      const target = event.target as HTMLElement;
      calculatePossiblePositions(target);
      target.classList.add("outline", "outline-blue-500", "outline-4", "-outline-offset-4");
      setIsDragging(true);
    },
    onDragLeave: (e: DragEvent) => {
      const event = e;
      event.stopPropagation();
      event.preventDefault();
      const target = event.target as HTMLElement;
      target.classList.remove("outline", "outline-blue-500", "outline-4", "-outline-offset-4");
    },
    onMouseOut: () => {
      setIsDragging(false);
      removePlaceholder();
    },
  };
};

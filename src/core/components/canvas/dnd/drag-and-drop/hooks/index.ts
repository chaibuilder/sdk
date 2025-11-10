/**
 * ============================================================================
 * DRAG AND DROP HOOKS - MAIN EXPORT
 * ============================================================================
 *
 * Central export file for all drag and drop hooks and utilities.
 * Import from this file to access the complete drag and drop system.
 *
 * @module hooks/index
 *
 * @example
 * import { useDragAndDrop } from './hooks';
 * const { onDrag, onDragOver, onDrop, onDragEnd, isDragging } = useDragAndDrop();
 */

import { useAtom } from "jotai";
import { DragEvent } from "react";
import { useBlockDragEnd } from "./use-block-drag-end";
import { useBlockDragOver } from "./use-block-drag-over";
import { useBlockDragStart } from "./use-block-drag-start";
import { useBlockDrop } from "./use-block-drop";
import { dropIndicatorAtom, isDragging } from "./use-drag-and-drop";

// Export individual hooks
export { useBlockDragEnd } from "./use-block-drag-end";
export { useBlockDragOver } from "./use-block-drag-over";
export { useBlockDragStart } from "./use-block-drag-start";
export { useBlockDrop } from "./use-block-drop";

// Export atoms and state
export { dragAndDropAtom, dropIndicatorAtom, isDragging, setIsDragging } from "./use-drag-and-drop";
export type { DropIndicatorState } from "./use-drag-and-drop";

/**
 * Interface for the complete drag and drop system
 */
export interface DragAndDrop {
  /** Handler for drag start event */
  onDrag: (e: DragEvent, block: any) => void;
  /** Handler for drag over event */
  onDragOver: (e: DragEvent) => void;
  /** Handler for drop event */
  onDrop: (e: DragEvent) => void;
  /** Handler for drag end event */
  onDragEnd: () => void;
  /** Whether a drag operation is currently active */
  isDragging: boolean;
}

/**
 * @HOOK useDragAndDrop
 * @description
 * Main hook that combines all drag and drop functionality.
 * Returns handlers for all drag events and the current dragging state.
 *
 * This is a convenience hook that wraps all individual drag hooks
 * into a single, easy-to-use interface.
 *
 * Features:
 * - Complete drag and drop lifecycle management
 * - Intelligent placeholder positioning
 * - Gap detection and edge-based placement
 * - Leaf block protection
 * - Visual feedback and validation
 *
 * @returns Object with all drag event handlers and state
 *
 * @example
 * const { onDrag, onDragOver, onDrop, onDragEnd, isDragging } = useDragAndDrop();
 *
 * <div
 *   draggable
 *   onDragStart={(e) => onDrag(e, block)}
 *   onDragOver={onDragOver}
 *   onDrop={onDrop}
 *   onDragEnd={onDragEnd}
 * >
 *   Block content
 * </div>
 */
export const useDragAndDrop = (): DragAndDrop => {
  const onDrag = useBlockDragStart();
  const onDragOver = useBlockDragOver();
  const onDrop = useBlockDrop();
  const onDragEnd = useBlockDragEnd();

  return {
    onDrag,
    onDragOver,
    onDrop,
    onDragEnd,
    isDragging,
  };
};

export const useDropIndicator = () => {
  const [dropIndicator] = useAtom(dropIndicatorAtom);
  return dropIndicator;
};

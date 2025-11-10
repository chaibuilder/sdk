/**
 * ============================================================================
 * USE DRAG PARENT HIGHLIGHT HOOK
 * ============================================================================
 *
 * Hook specifically for highlighting parent elements during drag operations.
 * This provides visual feedback to show which container will receive the dropped element.
 *
 * Uses direct inline style manipulation for immediate visibility without relying on CSS classes
 * or attributes. Applies a green dashed outline with a subtle background color.
 *
 * @module use-drag-parent-highlight
 */

import { useCanvasIframe } from "@/core/hooks/use-canvas-iframe";
import { useCallback, useMemo } from "react";

// Module-level variable to track the last highlighted parent during drag
let lastDragHighlighted: HTMLElement | null = null;

/**
 * @HOOK useDragParentHighlight
 * @description
 * Manages highlighting of parent elements during drag-and-drop operations.
 * Uses a separate tracking mechanism from the regular block highlight to avoid conflicts.
 *
 * Features:
 * - Highlights parent container during drag operations with inline styles
 * - Automatically clears previous highlight when highlighting a new parent
 * - Uses direct style manipulation (outline + background) for immediate visibility
 * - Separate from regular block highlighting to prevent conflicts
 * - Green dashed outline with subtle background for clear visual feedback
 *
 * @returns Object with highlightParent and clearParentHighlight functions
 *
 * @example
 * const { highlightParent, clearParentHighlight } = useDragParentHighlight();
 *
 * // Highlight a parent by ID
 * highlightParent("parent-block-id");
 *
 * // Highlight by element
 * highlightParent(element);
 *
 * // Clear highlight
 * clearParentHighlight();
 */
export const useDragParentHighlight = () => {
  const [iframe] = useCanvasIframe();
  const innerDoc = useMemo(
    () => (iframe as HTMLIFrameElement)?.contentDocument || (iframe as HTMLIFrameElement)?.contentWindow?.document,
    [iframe],
  );

  /**
   * @FUNCTION highlightParent
   * @description
   * Highlights a parent element during drag operations.
   * Accepts either an HTMLElement or a block ID string.
   * Automatically clears any previous highlight before applying the new one.
   *
   * @param elementOrID - Either an HTMLElement or a block ID string
   */
  const highlightParent = useCallback(
    (elementOrID: HTMLElement | string | null | undefined) => {
      if (!innerDoc) return;

      // Clear previous highlight
      if (lastDragHighlighted) {
        lastDragHighlighted.style.outline = "";
        lastDragHighlighted.style.outlineOffset = "";
      }

      // Handle null/undefined - just clear
      if (!elementOrID) {
        lastDragHighlighted = null;
        return;
      }

      // Highlight new parent element
      let targetElement: HTMLElement | null = null;

      if (typeof elementOrID !== "string") {
        // Direct HTMLElement
        targetElement = elementOrID;
      } else {
        // Block ID string - find element in DOM
        targetElement = innerDoc.querySelector(`[data-block-id="${elementOrID}"]`) as HTMLElement;
      }

      if (targetElement) {
        // Apply visual highlight styles directly
        targetElement.style.outline = "2px dashed rgba(34, 197, 94, 0.6)";
        targetElement.style.outlineOffset = "2px";
        lastDragHighlighted = targetElement;
      } else {
        lastDragHighlighted = null;
      }
    },
    [innerDoc],
  );

  /**
   * @FUNCTION clearParentHighlight
   * @description
   * Clears the parent highlight by removing inline styles.
   * Should be called when drag operation ends or when no valid parent is available.
   */
  const clearParentHighlight = useCallback(() => {
    if (lastDragHighlighted) {
      lastDragHighlighted.style.outline = "";
      lastDragHighlighted.style.outlineOffset = "";
      lastDragHighlighted = null;
    }
  }, []);

  return {
    highlightParent,
    clearParentHighlight,
    lastDragHighlighted,
  };
};

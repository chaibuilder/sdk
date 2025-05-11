import { useFrame } from "@/core/frame/frame-context";
import { ChaiBlock } from "@/types/chai-block";
import { cloneDeep } from "lodash-es";
import { createElement, useEffect, useState, useRef, memo, useMemo, useCallback } from "react";
import { getElementByDataBlockId } from "./chai-canvas";
import { useAtom } from "jotai";
import { inlineEditingActiveAtom } from "@/core/atoms/ui";
import { useUpdateBlocksProps } from "@/core/hooks/use-update-blocks-props";
import { useBlockHighlight } from "@/core/hooks/use-block-highlight";

const MemoizedEditor = memo(
  ({
    editingElement,
    blockContent,
    onClose,
    editorRef,
  }: {
    editingElement: HTMLElement;
    blockId: string;
    blockContent: string;
    onClose: () => void;
    editorRef: React.RefObject<HTMLElement>;
  }) => {
    const { document, window } = useFrame();

    useEffect(() => {
      if (editorRef.current) {
        editorRef.current.innerText = blockContent;
        editorRef.current.focus();

        // Move cursor to the end of the text content
        const range = document.createRange();
        const selection = window.getSelection();

        // Move cursor to the end of the text content
        range.selectNodeContents(editorRef.current);
        range.collapse(false); // This collapses the range to the end point

        // Apply the selection
        selection?.removeAllRanges();
        selection?.addRange(range);

        // Force focus and cursor position
        editorRef.current.focus();
      } else {
        onClose();
      }
    }, [document, window]);

    const getElementTag = (element: HTMLElement | null) => {
      const tag = element?.tagName?.toLowerCase() || "div";
      if (tag === "button") {
        return "div";
      }
      return tag;
    };

    return (
      <>
        {createElement(getElementTag(editingElement), {
          contentEditable: true,
          className: `${editingElement?.className?.replace("sr-only", "") || ""} outline outline-[2px] outline-green-500 shadow-none`,
          style: (cloneDeep(editingElement?.style) || {}) as any,
          ref: editorRef,
          onBlur: onClose,
          onKeyDown: (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onClose();
            }
          },
        })}
      </>
    );
  },
);

const WithBlockTextEditor = memo(
  ({ block, children }: { block: ChaiBlock; children: React.ReactNode }) => {
    const { document } = useFrame();
    const [editingBlockId, setEditingBlockId] = useAtom(inlineEditingActiveAtom);
    const [editingElement, setEditingElement] = useState<HTMLElement | null>(null);
    const editorRef = useRef<HTMLElement | null>(null);
    const { clearHighlight } = useBlockHighlight();

    // Memoize these values to prevent unnecessary recalculations
    const blockId = editingBlockId;
    const blockContent = block.content;
    const updateContent = useUpdateBlocksProps();

    // Memoize the onClose callback
    const handleClose = useCallback(() => {
      const content = editorRef.current?.innerText;
      updateContent([blockId], { content });
      setEditingElement(null);
      setEditingBlockId(null);
    }, [blockId, updateContent, setEditingBlockId]);

    useEffect(() => {
      if (!blockId) return;
      const element = getElementByDataBlockId(document, blockId as string);
      element?.classList?.add("sr-only");
      setEditingElement(element);
    }, [blockId, document]);

    const memoizedEditor = useMemo(() => {
      if (!editingElement) return null;

      clearHighlight();

      return (
        <MemoizedEditor
          blockId={blockId}
          editorRef={editorRef}
          blockContent={blockContent}
          editingElement={editingElement}
          onClose={handleClose}
        />
      );
    }, [editingElement, blockId, blockContent, handleClose]);

    return (
      <>
        {memoizedEditor}
        {children}
      </>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for memo
    return prevProps.block._id === nextProps.block._id && prevProps.block.content === nextProps.block.content;
  },
);

export default WithBlockTextEditor;

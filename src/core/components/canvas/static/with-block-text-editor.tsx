import { useFrame } from "@/core/frame/frame-context";
import { ChaiBlock } from "@/types/chai-block";
import { cloneDeep } from "lodash-es";
import { createElement, useEffect, useState, useRef, memo, useMemo, useCallback } from "react";
import { getElementByDataBlockId } from "./chai-canvas";
import { useAtom } from "jotai";
import { inlineEditingActiveAtom } from "@/core/atoms/ui";
import { useUpdateBlocksProps } from "@/core/hooks/use-update-blocks-props";
import { useBlockHighlight } from "@/core/hooks/use-block-highlight";
import { BubbleMenu, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { FontBoldIcon, FontItalicIcon, StrikethroughIcon } from "@radix-ui/react-icons";
import { useSelectedBlockIds } from "@/core/hooks/use-selected-blockIds";

/**
 * @description This is the editor that is used to edit the block content
 * It is memoized to prevent unnecessary re-renders
 * Editor for : RichText
 */
const RichTextEditor = memo(
  ({
    blockContent,
    onClose,
    onChange,
  }: {
    blockContent: string;
    onClose: (content: string) => void;
    onChange: (content: string) => void;
  }) => {
    const [, setIds] = useSelectedBlockIds();
    const { document } = useFrame();

    const editor = useEditor({
      editable: true,
      content: blockContent,
      extensions: [StarterKit],
      onUpdate: ({ editor }) => onChange(editor?.getHTML() || ""),
      onBlur: ({ editor, event }) => {
        // Only close if clicked outside both editor and bubble menu
        const target = event.relatedTarget as HTMLElement;
        const editorElement = document.querySelector(".ProseMirror");
        const bubbleMenu = document.querySelector(".tippy-box");

        const isEditorClicked = editorElement?.contains(target);
        const isBubbleMenuClicked = bubbleMenu?.contains(target);

        // Check if click was outside both editor and bubble menu
        if (!isEditorClicked && !isBubbleMenuClicked) {
          const content = editor?.getHTML() || "";
          editor?.destroy();
          onClose(content);

          setIds([]);
        }
      },
    });

    useEffect(() => {
      return () => {
        editor?.destroy();
      };
    }, []);

    return (
      <>
        {editor && (
          <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
            <div className="flex items-center overflow-hidden rounded-md bg-blue-500 text-white shadow-2xl">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`${editor.isActive("bold") ? "opacity-100" : "opacity-70 hover:opacity-90"} rounded-md p-1`}>
                <FontBoldIcon className="h-5 w-5" strokeWidth={4} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`${editor.isActive("italic") ? "opacity-100" : "opacity-70 hover:opacity-90"} rounded-md p-1`}>
                <FontItalicIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`${editor.isActive("strike") ? "opacity-100" : "opacity-70 hover:opacity-90"} rounded-md p-1`}>
                <StrikethroughIcon className="h-5 w-5" />
              </button>
            </div>
          </BubbleMenu>
        )}
        <EditorContent editor={editor} className="shadow-none outline outline-[2px] outline-green-500" />
      </>
    );
  },
);

/**
 * @description This is the editor that is used to edit the block content
 * It is memoized to prevent unnecessary re-renders
 * Editor for : Heading, Paragraph, Text, Span
 */
const MemoizedEditor = memo(
  ({
    editingElement,
    blockContent,
    onClose,
    editorRef,
  }: {
    editingElement: HTMLElement;
    blockContent: string;
    onClose: () => void;
    editorRef: React.RefObject<HTMLElement>;
  }) => {
    const [, setIds] = useSelectedBlockIds();
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

    const elementTag = useMemo(() => {
      const tag = editingElement?.tagName?.toLowerCase() || "div";
      return tag === "button" ? "div" : tag;
    }, [editingElement]);

    const onKeyDown = useCallback(
      (e) => {
        if (e.key === "Enter" || e.key === "Escape") {
          e.preventDefault();

          const blockId = editingElement?.getAttribute("data-block-id");
          onClose();

          // * Refocus the block after the editor is closed
          setIds([]);
          setTimeout(() => {
            setIds([blockId]);
          }, 100);
        }
      },
      [editingElement, onClose, setIds],
    );

    const onBlur = useCallback(() => {
      onClose();
      setIds([]);
    }, [onClose, setIds]);

    const memoizedProps = useMemo(() => {
      return {
        contentEditable: true,
        className: `${editingElement?.className?.replace("sr-only", "") || ""} outline outline-[2px] outline-green-500 shadow-none`,
        style: (cloneDeep(editingElement?.style) || {}) as any,
      };
    }, [editingElement?.className, editingElement?.style]);

    return (
      <>
        {createElement(elementTag, {
          onBlur: onBlur,
          ref: editorRef,
          onKeyDown: onKeyDown,
          ...memoizedProps,
        })}
      </>
    );
  },
);

/**
 * @description This is the component that is used to edit the block content
 * This is wrapper around the editor component
 */
const WithBlockTextEditor = memo(
  ({ block, children }: { block: ChaiBlock; children: React.ReactNode }) => {
    const { document } = useFrame();
    const [editingBlockId, setEditingBlockId] = useAtom(inlineEditingActiveAtom);
    const [editingElement, setEditingElement] = useState<HTMLElement | null>(null);
    const editorRef = useRef<HTMLElement | null>(null);
    const { clearHighlight } = useBlockHighlight();

    // Memoize these values to prevent unnecessary recalculations
    const blockId = editingBlockId;
    const blockType = block._type;
    const blockContent = block.content;
    const updateContent = useUpdateBlocksProps();

    // Memoize the onClose callback
    const handleClose = useCallback(
      (updatedContent?: string) => {
        const content = updatedContent || editorRef.current?.innerText;
        updateContent([blockId], { content });
        setEditingElement(null);

        // @TODO: (FIX ME) This is a hack to prevent the editor from being open when the block is not a RichText
        if (blockType !== "RichText") {
          setEditingBlockId(null);
        }
      },
      [blockId, updateContent, setEditingBlockId],
    );

    const handleChange = useCallback(
      (content: string) => {
        updateContent([blockId], { content });
      },
      [blockId, updateContent],
    );

    useEffect(() => {
      if (!blockId) return;
      const element = getElementByDataBlockId(document, blockId as string);
      element?.classList?.add("sr-only");
      if (blockType !== "RichText") setEditingElement(element);
    }, [blockId, blockType, document]);

    const memoizedEditor = useMemo(() => {
      if (blockType === "RichText") {
        clearHighlight();
        return <RichTextEditor blockContent={blockContent} onChange={handleChange} onClose={handleClose} />;
      }

      if (!editingElement) return null;

      clearHighlight();

      return (
        <MemoizedEditor
          editorRef={editorRef}
          blockContent={blockContent}
          editingElement={editingElement}
          onClose={handleClose}
        />
      );
    }, [editingElement, blockId, blockType, blockContent, handleClose]);

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

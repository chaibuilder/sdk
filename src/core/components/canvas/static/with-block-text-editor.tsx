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
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import {
  FontBoldIcon,
  FontItalicIcon,
  StrikethroughIcon,
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  UnderlineIcon,
  Link2Icon,
  LinkBreak2Icon,
  ListBulletIcon,
} from "@radix-ui/react-icons";
import { useSelectedBlockIds } from "@/core/hooks/use-selected-blockIds";
import Underline from "@tiptap/extension-underline";

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

    const getClassName = useCallback((isActive: boolean) => {
      return `${isActive ? "bg-white/20" : "hover:bg-white/10"} rounded-md p-1.5 transition-colors duration-200`;
    }, []);

    const editor = useEditor({
      editable: true,
      content: blockContent,
      extensions: [
        StarterKit,
        BulletList,
        OrderedList,
        Underline,
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: "text-blue-500 hover:text-blue-600 underline",
          },
        }),
      ],
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
          <BubbleMenu
            editor={editor}
            tippyOptions={{
              duration: 100,
              placement: "top",
            }}
            className="flex items-center overflow-hidden rounded-lg border border-blue-500/20 bg-blue-600 text-white shadow-lg">
            <div className="flex items-center p-1">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={getClassName(editor.isActive("bold"))}
                title="Bold">
                <FontBoldIcon className="h-4 w-4" strokeWidth={3} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={getClassName(editor.isActive("italic"))}
                title="Italic">
                <FontItalicIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={getClassName(editor.isActive("strike"))}
                title="Strikethrough">
                <StrikethroughIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={getClassName(editor.isActive("underline"))}
                title="Underline">
                <UnderlineIcon className="h-4 w-4" />
              </button>
              <div className="mx-1 h-4 w-[1px] bg-white/20"></div>
              <button
                onClick={() => {
                  if (editor.isActive("link")) {
                    editor.chain().focus().unsetLink().run();
                  } else {
                    const url = window.prompt("Enter URL");
                    if (url) {
                      editor.chain().focus().setLink({ href: url }).run();
                    }
                  }
                }}
                className={getClassName(editor.isActive("link"))}
                title={editor.isActive("link") ? "Remove link" : "Add link"}>
                {editor.isActive("link") ? <LinkBreak2Icon className="h-4 w-4" /> : <Link2Icon className="h-4 w-4" />}
              </button>
              <div className="mx-1 h-4 w-[1px] bg-white/20"></div>
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={getClassName(editor.isActive("bulletList"))}
                title="Bullet list">
                <ListBulletIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={getClassName(editor.isActive("orderedList"))}
                title="Numbered list">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4">
                  <path d="M10 12h11m-11 6h11M10 6h11M4 10h2M4 6h1v4m1 8H4c0-1 2-2 2-3s-1-1.5-2-1" />
                </svg>
              </button>
              <div className="mx-1 h-4 w-[1px] bg-white/20"></div>
              <button
                onClick={() => editor.chain().focus().setTextAlign("left").run()}
                className={getClassName(editor.isActive({ textAlign: "left" }))}
                title="Align left">
                <TextAlignLeftIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign("center").run()}
                className={getClassName(editor.isActive({ textAlign: "center" }))}
                title="Align center">
                <TextAlignCenterIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign("right").run()}
                className={getClassName(editor.isActive({ textAlign: "right" }))}
                title="Align right">
                <TextAlignRightIcon className="h-4 w-4" />
              </button>
            </div>
          </BubbleMenu>
        )}
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none shadow-none outline outline-[2px] outline-green-500"
        />
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
        id: "active-inline-editing-element",
        contentEditable: true,
        className: `${editingElement?.className?.replace("sr-only", "") || ""} outline outline-[2px] outline-green-500 shadow-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:absolute empty:before:pointer-events-none empty:before:select-none empty:before:inset-0 empty:before:z-0 relative min-h-[1em]`,
        style: (cloneDeep(editingElement?.style) || {}) as any,
        onInput: (e) => {
          const element = e.target as HTMLElement;
          if (!element) return;
          if (element.innerText.trim() === "") {
            element.setAttribute("data-placeholder", "Enter text here");
            if (element.children.length > 0) {
              element.children[0].remove();
            }
          } else {
            e.target.removeAttribute("data-placeholder");
          }
        },
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

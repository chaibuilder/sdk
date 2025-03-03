import { Editor, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useAtom } from "jotai";
import { first, isEmpty, omit, throttle } from "lodash-es";
import React, { useCallback, useEffect, useRef } from "react";
import { pageBlocksAtomsAtom } from "../../../atoms/blocks.ts";
import { inlineEditingActiveAtom, treeRefAtom } from "../../../atoms/ui.ts";
import { useFrame } from "../../../frame";
import { useBlockHighlight, useSelectedBlockIds, useSelectedStylingBlocks, useUpdateBlocksProps } from "../../../hooks";
import { useGetBlockAtomValue } from "../../../hooks/useUpdateBlockAtom.ts";
import { ChaiBlock } from "../../../types/ChaiBlock.ts";
import { useDnd } from "../dnd/useDnd.ts";

function getTargetedBlock(target) {
  // First check if the target is the canvas itself
  if (target.getAttribute("data-block-id") === "canvas") {
    return null;
  }

  // Then check for other blocks
  if (target.getAttribute("data-block-id") || target.getAttribute("data-block-parent")) {
    return target;
  }

  // When looking for parent blocks, exclude the canvas
  const closest = target.closest("[data-block-id]");
  return closest?.getAttribute("data-block-id") === "canvas" ? null : closest;
}

const useHandleCanvasDblClick = (editor: Editor, editorDiv: HTMLDivElement) => {
  const INLINE_EDITABLE_BLOCKS = []; //["Heading", "Paragraph", "Text", "Link", "Span", "Button"];
  const updateContent = useUpdateBlocksProps();
  const [editingBlockId, setEditingBlockId] = useAtom(inlineEditingActiveAtom);
  const { clearHighlight } = useBlockHighlight();
  const getBlockAtomValue = useGetBlockAtomValue(pageBlocksAtomsAtom);

  return useCallback(
    (e) => {
      if (editingBlockId) return;
      const chaiBlock: HTMLElement = getTargetedBlock(e.target);
      if (!chaiBlock) return;

      const blockType = chaiBlock.getAttribute("data-block-type");
      if (!blockType || !INLINE_EDITABLE_BLOCKS.includes(blockType)) {
        return;
      }
      const blockId = chaiBlock.getAttribute("data-block-id");
      if (!blockId) return;

      editor.on("update", ({ editor: editor2 }) => {
        console.log(editor2.getHTML());
      });
      editor.on("blur", () => {
        console.log("blur");
        const content = editor.getHTML();
        updateContent([blockId], { content });
        editorDiv.style.display = "none";
        chaiBlock.style.visibility = "visible";
      });

      setEditingBlockId(blockId);

      const content = (getBlockAtomValue(blockId) as ChaiBlock)["content"];

      editor.commands.setContent(content);
      editorDiv.style.display = "block";
      chaiBlock.style.visibility = "hidden";
      // place the editorDiv exactly overlapping the chaiBlock
      editorDiv.style.position = "absolute";
      editorDiv.style.top = `${chaiBlock.offsetTop}px`;
      editorDiv.style.left = `${chaiBlock.offsetLeft}px`;
      editorDiv.style.width = `${chaiBlock.offsetWidth}px`;
      editorDiv.style.height = `${chaiBlock.offsetHeight}px`;
      // copy classNames from chaiBlock to editorDiv
      editorDiv.classList.add(...chaiBlock.classList);
    },
    [editingBlockId, clearHighlight, getBlockAtomValue, setEditingBlockId, updateContent, editor, editorDiv],
  );
};

const useHandleCanvasClick = () => {
  const [, setStyleBlockIds] = useSelectedStylingBlocks();
  const [ids, setIds] = useSelectedBlockIds();
  const [editingBlockId] = useAtom(inlineEditingActiveAtom);
  const [treeRef] = useAtom(treeRefAtom);
  const { clearHighlight } = useBlockHighlight();
  return (e: any) => {
    if (editingBlockId) return;
    e.stopPropagation();
    const chaiBlock: HTMLElement = getTargetedBlock(e.target);
    if (chaiBlock?.getAttribute("data-block-id") && chaiBlock?.getAttribute("data-block-id") === "container") {
      setIds([]);
      setStyleBlockIds([]);
      clearHighlight();
      return;
    }

    if (chaiBlock?.getAttribute("data-block-parent")) {
      // check if target element has data-styles-prop attribute
      const styleProp = chaiBlock.getAttribute("data-style-prop") as string;
      const styleId = chaiBlock.getAttribute("data-style-id") as string;
      const blockId = chaiBlock.getAttribute("data-block-parent") as string;
      if (!ids.includes(blockId)) {
        treeRef?.closeAll();
      }

      setStyleBlockIds([{ id: styleId, prop: styleProp, blockId }]);
      setIds([blockId]);
    } else if (chaiBlock?.getAttribute("data-block-id")) {
      const blockId = chaiBlock.getAttribute("data-block-id");
      if (!ids.includes(blockId)) {
        treeRef?.closeAll();
      }
      setStyleBlockIds([]);
      setIds(blockId === "canvas" ? [] : [blockId]);
    }

    clearHighlight();
  };
};

const useHandleMouseMove = () => {
  const [editingBlockId] = useAtom(inlineEditingActiveAtom);
  const { highlightBlock } = useBlockHighlight();

  return throttle((e: any) => {
    if (editingBlockId) return;
    const chaiBlock = getTargetedBlock(e.target);
    if (chaiBlock) {
      highlightBlock(chaiBlock);
    }
  }, 20);
};

const useHandleMouseLeave = () => {
  const { clearHighlight } = useBlockHighlight();
  return clearHighlight;
};

export const Canvas = ({ children }: { children: React.ReactNode }) => {
  const { document } = useFrame();
  const [ids] = useSelectedBlockIds();
  const [styleIds, setSelectedStylingBlocks] = useSelectedStylingBlocks();
  const { clearHighlight } = useBlockHighlight();

  // Add cleanup effect
  useEffect(() => {
    return clearHighlight;
  }, [clearHighlight]);

  useEffect(() => {
    setTimeout(() => {
      if (!isEmpty(styleIds)) {
        return;
      }
      const element = getElementByDataBlockId(document, first(ids) as string);
      if (element) {
        const styleProp = element.getAttribute("data-style-prop") as string;
        if (styleProp) {
          const styleId = element.getAttribute("data-style-id") as string;
          const blockId = element.getAttribute("data-block-parent") as string;
          setSelectedStylingBlocks([{ id: styleId, prop: styleProp, blockId }]);
        }
      }
    }, 100);
  }, [document, ids, setSelectedStylingBlocks, styleIds]);

  const editor = useEditor({
    extensions: [StarterKit],
  });
  const editorRef = useRef<HTMLDivElement>(null);
  const handleDblClick = useHandleCanvasDblClick(editor, editorRef.current);
  const handleCanvasClick = useHandleCanvasClick();
  const handleMouseMove = useHandleMouseMove();
  const handleMouseLeave = useHandleMouseLeave();
  const dnd = useDnd();

  return (
    <div
      data-block-id={"canvas"}
      id="canvas"
      onClick={handleCanvasClick}
      onDoubleClick={handleDblClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...omit(dnd, "isDragging")}
      className={`relative h-full max-w-full p-px ` + (dnd.isDragging ? "dragging" : "") + ""}>
      {children}
    </div>
  );
};

export const getElementByDataBlockId = (doc: any, blockId: string): HTMLElement =>
  doc.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement;

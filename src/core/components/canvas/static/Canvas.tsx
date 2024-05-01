import React, { useEffect } from "react";
import { useFrame } from "../../../frame";
import { useSelectedBlockIds, useSelectedStylingBlocks, useUpdateBlocksProps } from "../../../hooks";
import { first, isEmpty } from "lodash";
import { Quill } from "react-quill";
import { useAtom } from "jotai";
import { inlineEditingActiveAtom } from "../../../atoms/ui.ts";

function getTargetedBlock(target) {
  // check if target is a block by checking attr data-block-id else get .closest('[data-block-id]')
  if (target.getAttribute("data-block-id")) {
    return target;
  }
  return target.closest("[data-block-id]");
}

function destroyQuill(quill) {
  // If you have attached event listeners directly to the Quill instance or its elements,
  // you should remove them here.

  // Clear the contents of the Quill editor
  quill.container.innerHTML = "";

  // Optionally, remove the editor container from the DOM
  quill.container.parentNode.removeChild(quill.container);

  // If there's a separate toolbar, hide or remove it
  var toolbar = document.querySelector(".ql-toolbar");
  if (toolbar) {
    toolbar.parentNode.removeChild(toolbar);
  }

  // Nullify the instance if you don't plan to use it anymore
  quill = null;
}

const useHandleInlineEdit = () => {
  const INLINE_EDITABLE_BLOCKS = ["Heading", "Paragraph", "Span", "Button"];
  const updateContent = useUpdateBlocksProps();
  const [, setIds] = useSelectedBlockIds();
  const [, setEditingBlockId] = useAtom(inlineEditingActiveAtom);
  return {
    handleDblClick: (e) => {
      const chaiBlock: HTMLElement = getTargetedBlock(e.target);
      const blockType = chaiBlock.getAttribute("data-block-type");
      if (!blockType || !INLINE_EDITABLE_BLOCKS.includes(blockType)) {
        return;
      }
      setEditingBlockId(chaiBlock.getAttribute("data-block-id"));
      chaiBlock.style.display = "none";
      // move chaiBlock element to the end of #canvas element

      const newBlock = chaiBlock.cloneNode(true) as HTMLElement;
      Array.from(newBlock.attributes).forEach((attr) => {
        if (attr.name !== "class") newBlock.removeAttribute(attr.name);
      });
      chaiBlock.parentNode.insertBefore(newBlock, chaiBlock.nextSibling);
      newBlock.style.display = "block";
      const quill = new Quill(newBlock);
      function blurListener() {
        const content = quill.getText(0, quill.getLength());
        updateContent([chaiBlock.getAttribute("data-block-id")], { content });
        chaiBlock.removeAttribute("style");
        newBlock.removeEventListener("blur", blurListener, true);
        destroyQuill(quill);
        setEditingBlockId("");
      }
      newBlock.addEventListener("blur", blurListener, true);
      quill.focus();
      // remove .ql-clipboard element from newBlock
      newBlock.querySelector(".ql-clipboard")?.remove();

      setIds([]);
    },
  };
};

export const Canvas = ({ children }: { children: React.ReactNode }) => {
  const { document } = useFrame();
  const [ids] = useSelectedBlockIds();
  const [styleIds, setSelectedStylingBlocks] = useSelectedStylingBlocks();

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
  const { handleDblClick } = useHandleInlineEdit();

  return (
    <div id="canvas" onDoubleClick={handleDblClick} className={`relative h-screen max-w-full`}>
      {children}
    </div>
  );
};
export const getElementByDataBlockId = (doc: any, blockId: string): HTMLElement =>
  doc.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement;

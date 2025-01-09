import React from "react";
import { omit, isEmpty, get, isObject } from "lodash-es";
import { useBlockHighlight, useSelectedBlockIds } from "../../../../hooks";
import { emitChaiBuilderMsg, CHAI_BUILDER_EVENTS } from "../../../../events";
import { useAtom } from "jotai";
import { draggedBlockAtom } from "../../../canvas/dnd/atoms";
import { getBlocksFromHTML } from "../../../../main";

type ChaiDraggableBlockProps = {
  html?: string | (() => Promise<any>);
  block?: any;
  blocks?: any | (() => Promise<any>);
  children: React.ReactNode;
};

/**
 *
 * @description
 * This component represents a draggable block within the Chai Builder interface.
 * It handles the drag start event by setting the dragged block and emitting a message to close the add block panel.
 * block, blocks, html
 */
export const ChaiDraggableBlock = ({ block, html, blocks, children }: ChaiDraggableBlockProps) => {
  const [, setDraggedBlock] = useAtom(draggedBlockAtom);
  const [, setSelected] = useSelectedBlockIds();
  const { clearHighlight } = useBlockHighlight();

  // * Handles the drag start event by preparing the block data to be dragged.
  const handleDragStart = async (ev) => {
    try {
      // Check if there's no data to drag
      if (isEmpty(html) && isEmpty(block) && isEmpty(blocks)) {
        return;
      }

      let chaiBlock: any = null;

      // Handle async html or blocks functions
      const resolvedHtml = typeof html === 'function' ? (await html()).html : html;
      const resolvedBlocks = typeof blocks === 'function' ? (await blocks()).blocks : blocks;

      // Determine the source of the block data
      if (Array.isArray(resolvedBlocks) || !isEmpty(resolvedHtml)) {
        chaiBlock = !isEmpty(resolvedHtml) ? getBlocksFromHTML(resolvedHtml) : resolvedBlocks;
        if (isEmpty(chaiBlock)) return;

        chaiBlock = {
          uiLibrary: true,
          blocks: chaiBlock,
          parent: get(chaiBlock, "0._parent", null) || null,
        };
      } else if (isObject(block)) {
        chaiBlock = omit(block, ["component", "icon"]);
      }

      if (!chaiBlock) return;

      ev.dataTransfer.setData("text/plain", JSON.stringify(chaiBlock));

      // @ts-ignore
      setDraggedBlock(chaiBlock);
      emitChaiBuilderMsg({ name: CHAI_BUILDER_EVENTS.CLOSE_ADD_BLOCK });
      setTimeout(() => {
        setSelected([]);
        clearHighlight();
      }, 200);
    } catch (error) {
      console.error('Error in drag start:', error);
    }
  };

  return (
    <div draggable onDragStart={handleDragStart} className="cursor-grab">
      {children}
    </div>
  );
};

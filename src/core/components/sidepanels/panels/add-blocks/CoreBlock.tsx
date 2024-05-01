import { DragPreviewImage, useDrag } from "react-dnd";
import { useAtom } from "jotai";
import { first, has, omit } from "lodash";
import { createElement } from "react";
import { BoxIcon } from "@radix-ui/react-icons";
import { activePanelAtom } from "../../../../atoms/ui";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../../ui";
import { useAddBlock, useSelectedBlockIds } from "../../../../hooks";
import { syncBlocksWithDefaults } from "@chaibuilder/runtime";
import { addBlocksModalAtom } from "../../../../atoms/blocks";

export const CoreBlock = ({ block }: { block: any }) => {
  const { type, icon, label } = block;
  const { addCoreBlock, addPredefinedBlock } = useAddBlock();
  const [ids] = useSelectedBlockIds();
  const [, setActivePanel] = useAtom(activePanelAtom);
  const [, setAddBlocks] = useAtom(addBlocksModalAtom);
  const addBlockToPage = () => {
    if (has(block, "blocks")) {
      addPredefinedBlock(syncBlocksWithDefaults(block.blocks), first(ids));
    } else {
      addCoreBlock(block, first(ids));
    }
    setAddBlocks(false);
    setActivePanel("layers");
  };

  const [, drag, dragPreview] = useDrag(() => ({
    type: "CHAI_BLOCK",
    item: block,
  }));

  return (
    <>
      <DragPreviewImage
        connect={dragPreview}
        src={"https://placehold.co/100x30/000000/FFF?text=" + (label || type).replace(/ /g, "+")}
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={addBlockToPage}
            type="button"
            onDragStart={(ev) => {
              ev.dataTransfer.setData("text/plain", JSON.stringify(omit(block, ["component", "icon"])));
              setTimeout(() => {
                setAddBlocks(false);
                setActivePanel("layers");
              }, 200);
            }}
            draggable={"true"}
            className="cursor-grab space-y-2 rounded-lg border border-border p-3 text-center hover:bg-slate-300/50">
            {createElement(icon || BoxIcon, { className: "w-4 h-4 mx-auto" })}
            <p className="truncate text-xs">{label || type}</p>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label || type}</p>
        </TooltipContent>
      </Tooltip>
    </>
  );
};

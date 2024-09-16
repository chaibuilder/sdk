import { useAtom } from "jotai";
import { has, isFunction, omit } from "lodash-es";
import { createElement } from "react";
import { BoxIcon } from "@radix-ui/react-icons";
import { activePanelAtom } from "../../../../atoms/ui";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../../ui";
import { useAddBlock, useHighlightBlockId, useSelectedBlockIds } from "../../../../hooks";
import { syncBlocksWithDefaults } from "@chaibuilder/runtime";
import { OUTLINE_KEY, ROOT_TEMP_KEY } from "../../../../constants/STRINGS.ts";
import { draggedBlockAtom } from "../../../canvas/dnd/atoms.ts";
import { useFeature } from "flagged";
import { useAddBlocksModal } from "../../../../hooks/useAddBlocks.ts";

export const CoreBlock = ({ block, disabled }: { block: any; disabled: boolean }) => {
  const [, setDraggedBlock] = useAtom(draggedBlockAtom);
  const { type, icon, label } = block;
  const { addCoreBlock, addPredefinedBlock } = useAddBlock();
  const [, setSelected] = useSelectedBlockIds();
  const [, setHighlighted] = useHighlightBlockId();
  const [, setActivePanel] = useAtom(activePanelAtom);
  const [openId, setOpen] = useAddBlocksModal();
  const addBlockToPage = () => {
    if (has(block, "blocks")) {
      const blocks = isFunction(block.blocks) ? block.blocks() : block.blocks;
      addPredefinedBlock(syncBlocksWithDefaults(blocks), openId === ROOT_TEMP_KEY ? null : openId);
    } else {
      addCoreBlock(block, openId === ROOT_TEMP_KEY ? null : openId);
    }
    setOpen("");
    setActivePanel(OUTLINE_KEY);
  };
  const dnd = useFeature("dnd");
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            disabled={disabled}
            onClick={addBlockToPage}
            type="button"
            onDragStart={(ev) => {
              ev.dataTransfer.setData("text/plain", JSON.stringify(omit(block, ["component", "icon"])));
              ev.dataTransfer.setDragImage(new Image(), 0, 0);
              // @ts-ignore
              setDraggedBlock(omit(block, ["component", "icon"]));
              setTimeout(() => {
                setSelected([]);
                setHighlighted(null);
                setActivePanel(OUTLINE_KEY);
              }, 200);
            }}
            draggable={dnd ? "true" : "false"}
            className={
              "cursor-pointer space-y-2 rounded-lg border border-border p-3 text-center hover:bg-slate-300/50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
            }>
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

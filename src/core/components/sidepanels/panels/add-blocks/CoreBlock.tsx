import { useAtom } from "jotai";
import { first, has, omit } from "lodash-es";
import { createElement } from "react";
import { BoxIcon } from "@radix-ui/react-icons";
import { activePanelAtom } from "../../../../atoms/ui";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../../ui";
import { useAddBlock, useHighlightBlockId, useSelectedBlockIds } from "../../../../hooks";
import { syncBlocksWithDefaults } from "@chaibuilder/runtime";
import { useFeature } from "flagged";

export const CoreBlock = ({ block }: { block: any }) => {
  const { type, icon, label } = block;
  const { addCoreBlock, addPredefinedBlock } = useAddBlock();
  const [ids, setSelected] = useSelectedBlockIds();
  const [, setHighlighted] = useHighlightBlockId();
  const [, setActivePanel] = useAtom(activePanelAtom);
  const addBlockToPage = () => {
    if (has(block, "blocks")) {
      addPredefinedBlock(syncBlocksWithDefaults(block.blocks), first(ids));
    } else {
      addCoreBlock(block, first(ids));
    }
    setActivePanel("layers");
  };
  const dndEnabled = useFeature("dnd");

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={addBlockToPage}
            type="button"
            onDragStart={(ev) => {
              ev.dataTransfer.setData("text/plain", JSON.stringify(omit(block, ["component", "icon"])));
              setTimeout(() => {
                setSelected([]);
                setHighlighted(null);
                setActivePanel("layers");
              }, 200);
            }}
            draggable={dndEnabled ? "true" : "false"}
            className={
              "space-y-2 rounded-lg border border-border p-3 text-center hover:bg-slate-300/50 " +
              (dndEnabled ? "cursor-grab" : "cursor-pointer")
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

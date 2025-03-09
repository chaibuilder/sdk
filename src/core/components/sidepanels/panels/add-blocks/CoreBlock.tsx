import { useAtom } from "jotai";
import { capitalize, has, isFunction, omit } from "lodash-es";
import { createElement } from "react";
import { BoxIcon } from "@radix-ui/react-icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../../ui";
import { useAddBlock, useBlockHighlight, useSelectedBlockIds } from "../../../../hooks";
import { syncBlocksWithDefaults } from "@chaibuilder/runtime";
import { draggedBlockAtom } from "../../../canvas/dnd/atoms.ts";
import { useTranslation } from "react-i18next";
import { CHAI_BUILDER_EVENTS, emitChaiBuilderMsg } from "../../../../events.ts";

export const CoreBlock = ({
  block,
  position,
  disabled,
  parentId,
}: {
  block: any;
  position: number;
  disabled: boolean;
  parentId?: string;
}) => {
  const [, setDraggedBlock] = useAtom(draggedBlockAtom);
  const { type, icon, label } = block;
  const { addCoreBlock, addPredefinedBlock } = useAddBlock();
  const [, setSelected] = useSelectedBlockIds();
  const { clearHighlight } = useBlockHighlight();
  const addBlockToPage = () => {
    if (has(block, "blocks")) {
      const blocks = isFunction(block.blocks) ? block.blocks() : block.blocks;
      addPredefinedBlock(syncBlocksWithDefaults(blocks), parentId || null, position);
    } else {
      addCoreBlock(block, parentId || null, position);
    }
    emitChaiBuilderMsg({ name: CHAI_BUILDER_EVENTS.CLOSE_ADD_BLOCK });
  };
  const { t } = useTranslation();

  const handleDragStart = (ev) => {
    ev.dataTransfer.setData("text/plain", JSON.stringify(omit(block, ["component", "icon"])));
    // @ts-ignore
    setDraggedBlock(omit(block, ["component", "icon"]));
    emitChaiBuilderMsg({ name: CHAI_BUILDER_EVENTS.CLOSE_ADD_BLOCK });
    setTimeout(() => {
      setSelected([]);
      clearHighlight();
    }, 200);
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            draggable
            disabled={disabled}
            onClick={addBlockToPage}
            type="button"
            onDragStart={handleDragStart}
            className={
              "cursor-pointer space-y-2 rounded-lg border border-border p-3 text-center hover:bg-slate-300/50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-700 dark:text-white dark:hover:bg-slate-800/50 dark:disabled:bg-gray-900 dark:disabled:text-foreground"
            }>
            {createElement(icon || BoxIcon, { className: "w-4 h-4 mx-auto" })}
            <p className="truncate text-xs">{capitalize(t(label || type))}</p>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t(label || type)}</p>
        </TooltipContent>
      </Tooltip>
    </>
  );
};

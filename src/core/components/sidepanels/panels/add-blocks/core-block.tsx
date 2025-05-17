import { draggedBlockAtom } from "@/core/components/canvas/dnd/atoms";
import { CHAI_BUILDER_EVENTS } from "@/core/events";
import { useAddBlock, useBlockHighlight, useSelectedBlockIds } from "@/core/hooks";
import { pubsub } from "@/core/pubsub";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/shadcn/components/ui/tooltip";
import { syncBlocksWithDefaults } from "@chaibuilder/runtime";
import { BoxIcon } from "@radix-ui/react-icons";
import { useFeature } from "flagged";
import { useAtom } from "jotai";
import { capitalize, has, isFunction, omit } from "lodash-es";
import { createElement } from "react";
import { useTranslation } from "react-i18next";

export const CoreBlock = ({
  block,
  disabled,
  parentId,
  position,
}: {
  block: any;
  disabled: boolean;
  parentId?: string;
  position?: number;
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
    pubsub.publish(CHAI_BUILDER_EVENTS.CLOSE_ADD_BLOCK);
  };
  const dnd = useFeature("dnd");
  const { t } = useTranslation();
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
                clearHighlight();
              }, 200);
            }}
            draggable={dnd ? "true" : "false"}
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

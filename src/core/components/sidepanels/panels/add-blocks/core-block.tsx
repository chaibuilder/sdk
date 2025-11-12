import { useDragAndDrop } from "@/core/components/canvas/dnd/drag-and-drop/hooks";
import { CHAI_BUILDER_EVENTS } from "@/core/events";
import { useAddBlock } from "@/core/hooks";
import { useChaiFeatureFlag } from "@/core/main";
import { pubsub } from "@/core/pubsub";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/shadcn/components/ui/tooltip";
import { syncBlocksWithDefaults } from "@chaibuilder/runtime";
import { BoxIcon } from "@radix-ui/react-icons";
import { capitalize, has, isFunction, kebabCase } from "lodash-es";
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
  const { type, icon, label } = block;
  const { addCoreBlock, addPredefinedBlock } = useAddBlock();
  const addBlockToPage = () => {
    if (has(block, "blocks")) {
      const blocks = isFunction(block.blocks) ? block.blocks() : block.blocks;
      addPredefinedBlock(syncBlocksWithDefaults(blocks), parentId || null, position);
    } else {
      addCoreBlock(block, parentId || null, position);
    }
    pubsub.publish(CHAI_BUILDER_EVENTS.CLOSE_ADD_BLOCK);
  };
  const enabledDnd = useChaiFeatureFlag("enable-drag-and-drop");

  const { t } = useTranslation();
  const { onDragStart, onDragEnd } = useDragAndDrop();

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            disabled={disabled}
            onClick={addBlockToPage}
            type="button"
            onDragStart={(ev) => onDragStart(ev, { ...block, label: label, icon: icon })}
            onDragEnd={onDragEnd}
            draggable={enabledDnd}
            className={`${kebabCase(`chai-block-${type}`)} cursor-pointer space-y-2 rounded-lg border border-border p-3 text-center hover:bg-slate-300/50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-700 dark:text-white dark:hover:bg-slate-800/50 dark:disabled:bg-gray-900 dark:disabled:text-foreground ${
              disabled ? "opacity-50" : ""
            }`}>
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

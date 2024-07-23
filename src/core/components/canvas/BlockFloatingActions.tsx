import { flip } from "@floating-ui/dom";
import { shift, useFloating } from "@floating-ui/react-dom";
import { get, isEmpty, pick } from "lodash-es";
import { ArrowUpIcon, CopyIcon, DragHandleDots2Icon, TrashIcon } from "@radix-ui/react-icons";
import { canDeleteBlock, canDuplicateBlock } from "../../functions/block-helpers.ts";
import { ChaiBlock } from "../../types/ChaiBlock";
import {
  useDuplicateBlocks,
  useHighlightBlockId,
  useRemoveBlocks,
  useSelectedBlockIds,
  useSelectedStylingBlocks,
} from "../../hooks";
import { useResizeObserver } from "@react-hookz/web";
import { useAtom } from "jotai";
import { draggedBlockIdAtom, inlineEditingActiveAtom } from "../../atoms/ui.ts";
import { useFeature } from "flagged";

/**
 * @param block
 * @param label
 */
const BlockActionLabel = ({ block, label }: any) => {
  const [, setSelected] = useSelectedBlockIds();
  const [, setHighlighted] = useHighlightBlockId();
  const [, setDraggedBlockId] = useAtom(draggedBlockIdAtom);
  const dndSupport = useFeature("dnd");
  return (
    <div
      className="mr-10 flex cursor-grab items-center space-x-1 px-1"
      draggable={dndSupport ? "true" : "false"}
      onDragStart={(ev) => {
        ev.dataTransfer.setData("text/plain", JSON.stringify(pick(block, ["_id", "_type"])));
        setDraggedBlockId(block._id);
        setTimeout(() => {
          setSelected([]);
          setHighlighted(null);
        }, 200);
      }}>
      <DragHandleDots2Icon />
      {label}
    </div>
  );
};

type BlockActionProps = {
  block: ChaiBlock;
  selectedBlockElement: HTMLElement | undefined;
};

export const BlockActionsStatic = ({ selectedBlockElement, block }: BlockActionProps) => {
  const removeBlock = useRemoveBlocks();
  const duplicateBlock = useDuplicateBlocks();
  const [, setSelectedIds] = useSelectedBlockIds();
  const [, setStyleBlocks] = useSelectedStylingBlocks();
  const [editingBlockId] = useAtom(inlineEditingActiveAtom);
  const { floatingStyles, refs, update } = useFloating({
    placement: "top-start",
    middleware: [shift(), flip()],
    elements: {
      reference: selectedBlockElement,
    },
  });

  useResizeObserver(selectedBlockElement as HTMLElement, () => update(), selectedBlockElement !== null);

  const parentId: string | undefined | null = get(block, "_parent", null);

  const label: string = isEmpty(get(block, "_name", "")) ? get(block, "_type", "") : get(block, "_name", "");

  if (!selectedBlockElement || !block || editingBlockId) return null;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        ref={refs.setFloating}
        style={floatingStyles}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onKeyDown={(e) => e.stopPropagation()}
        className="z-[99999] flex h-6 items-center bg-blue-500 py-2 text-xs text-white">
        <BlockActionLabel label={label} block={block} />

        <div className="flex gap-2 px-1">
          {parentId && (
            <ArrowUpIcon
              className="hover:scale-105"
              onClick={() => {
                setStyleBlocks([]);
                setSelectedIds([parentId]);
              }}
            />
          )}
          {canDuplicateBlock(get(block, "_type", "")) ? (
            <CopyIcon className="hover:scale-105" onClick={() => duplicateBlock([block?._id])} />
          ) : null}
          {canDeleteBlock(get(block, "_type", "")) ? (
            <TrashIcon className="hover:scale-105" onClick={() => removeBlock([block?._id])} />
          ) : null}
        </div>
      </div>
    </>
  );
};

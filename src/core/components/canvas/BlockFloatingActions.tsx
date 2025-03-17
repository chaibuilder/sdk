import { flip } from "@floating-ui/dom";
import { shift, useFloating } from "@floating-ui/react-dom";
import { ArrowUpIcon, CopyIcon, DragHandleDots2Icon, PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { useResizeObserver } from "@react-hookz/web";
import { useFeature } from "flagged";
import { useAtom } from "jotai";
import { get, isEmpty, pick } from "lodash-es";
import { inlineEditingActiveAtom } from "../../atoms/ui.ts";
import { useFrame } from "../../frame/Context.tsx";
import { canDeleteBlock, canDuplicateBlock } from "../../functions/block-helpers.ts";
import {
  useDuplicateBlocks,
  useHighlightBlockId,
  usePermissions,
  useRemoveBlocks,
  useSelectedBlockIds,
  useSelectedStylingBlocks,
} from "../../hooks";
import { PERMISSIONS } from "../../main/index.ts";
import { ChaiBlock } from "../../types/ChaiBlock";
import BlockController from "../sidepanels/panels/add-blocks/BlockController.tsx";
import AddBlockDropdown from "./AddBlockDropdown.tsx";
import { draggedBlockAtom } from "./dnd/atoms.ts";

/**
 * @param block
 * @param label
 */
const BlockActionLabel = ({ block, label }: any) => {
  const [, setSelected] = useSelectedBlockIds();
  const [, setHighlighted] = useHighlightBlockId();
  const [, setDraggedBlock] = useAtom(draggedBlockAtom);
  const dnd = useFeature("dnd");
  return (
    <div
      className="mr-10 flex cursor-default items-center space-x-1 px-1"
      draggable={dnd ? "true" : "false"}
      onDragStart={(ev) => {
        ev.dataTransfer.setData("text/plain", JSON.stringify(pick(block, ["_id", "_type", "_name"])));
        //@ts-ignore
        setDraggedBlock(block);
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

export const BlockFloatingSelector = ({ selectedBlockElement, block }: BlockActionProps) => {
  const removeBlock = useRemoveBlocks();
  const duplicateBlock = useDuplicateBlocks();
  const [, setSelectedIds] = useSelectedBlockIds();
  const [, setHighlighted] = useHighlightBlockId();
  const [, setStyleBlocks] = useSelectedStylingBlocks();
  const { hasPermission } = usePermissions();
  const [editingBlockId] = useAtom(inlineEditingActiveAtom);
  const { document } = useFrame();
  const { floatingStyles, refs, update } = useFloating({
    placement: "top-start",
    middleware: [shift(), flip()],
    elements: {
      reference: selectedBlockElement,
    },
  });

  useResizeObserver(selectedBlockElement as HTMLElement, () => update(), selectedBlockElement !== null);
  useResizeObserver(document?.body, () => update(), document?.body !== null);

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
        onMouseEnter={(e) => {
          e.stopPropagation();
          setHighlighted(null);
        }}
        onKeyDown={(e) => e.stopPropagation()}
        className="isolate z-[999] flex h-6 items-center bg-blue-500 py-2 text-xs text-white">
        {parentId && (
          <ArrowUpIcon
            className="hover:scale-105"
            onClick={() => {
              setStyleBlocks([]);
              setSelectedIds([parentId]);
            }}
          />
        )}
        <BlockActionLabel label={label} block={block} />

        <div className="flex items-center gap-2 pl-1 pr-1.5">
          <AddBlockDropdown block={block}>
            <PlusIcon className="hover:scale-105" />
          </AddBlockDropdown>
          {canDuplicateBlock(get(block, "_type", "")) && hasPermission(PERMISSIONS.ADD_BLOCK) ? (
            <CopyIcon className="hover:scale-105" onClick={() => duplicateBlock([block?._id])} />
          ) : null}
          {canDeleteBlock(get(block, "_type", "")) && hasPermission(PERMISSIONS.DELETE_BLOCK) ? (
            <TrashIcon className="hover:scale-105" onClick={() => removeBlock([block?._id])} />
          ) : null}

          {hasPermission(PERMISSIONS.MOVE_BLOCK) && <BlockController block={block} updateFloatingBar={update} />}
        </div>
      </div>
    </>
  );
};

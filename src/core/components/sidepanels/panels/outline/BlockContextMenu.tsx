import { CopyIcon, TrashIcon } from "@radix-ui/react-icons";
import React, { useCallback } from "react";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "../../../../../ui";
import { useDuplicateBlocks, useRemoveBlocks, useSelectedBlock, useSelectedBlockIds } from "../../../../hooks";
import { canDeleteBlock, canDuplicateBlock } from "../../../../functions/block-helpers.ts";

const RemoveBlocks = () => {
  const [selectedIds] = useSelectedBlockIds();
  const removeBlocks = useRemoveBlocks();
  const selectedBlock = useSelectedBlock();

  return (
    <ContextMenuItem
      // @ts-ignore
      disabled={!canDeleteBlock(selectedBlock?._type)}
      className="flex items-center gap-x-4 text-xs"
      onClick={() => removeBlocks(selectedIds)}>
      <TrashIcon /> Remove
    </ContextMenuItem>
  );
};

const BlockContextMenuContent = () => {
  const [selectedIds] = useSelectedBlockIds();
  const duplicateBlocks = useDuplicateBlocks();
  const selectedBlock = useSelectedBlock();

  const duplicate = useCallback(() => {
    duplicateBlocks(selectedIds);
  }, [selectedIds, duplicateBlocks]);

  return (
    <ContextMenuContent className="text-xs">
      <ContextMenuItem
        disabled={!canDuplicateBlock(selectedBlock?._type)}
        className="flex items-center gap-x-4 text-xs"
        onClick={duplicate}>
        <CopyIcon /> Duplicate
      </ContextMenuItem>
      <RemoveBlocks />
    </ContextMenuContent>
  );
};

export const BlockContextMenu = ({ children }: { children: React.ReactNode | null; id: any }) => {
  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>{children}</ContextMenuTrigger>
        <BlockContextMenuContent />
      </ContextMenu>
    </>
  );
};

// const CutBlocks = () => {
//   const [selectedIds] = useSelectedBlockIds();
//   const [, setCutIds] = useCutBlockIds();
//
//   return (
//     <ContextMenuItem className="flex items-center gap-x-4 text-xs" onClick={() => setCutIds(selectedIds)}>
//       <ScissorsIcon /> Cut
//     </ContextMenuItem>
//   );
// };
//
// const CopyBlocks = () => {
//   const [selectedIds] = useSelectedBlockIds();
//   const [, setCopyIds] = useCopyBlockIds();
//
//   return (
//     <ContextMenuItem className="flex items-center gap-x-4 text-xs" onClick={() => setCopyIds(selectedIds)}>
//       <ClipboardIcon /> Copy
//     </ContextMenuItem>
//   );
// };

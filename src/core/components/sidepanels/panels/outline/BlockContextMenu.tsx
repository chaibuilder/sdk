import { CardStackIcon, CardStackPlusIcon, CopyIcon, ScissorsIcon, TrashIcon } from "@radix-ui/react-icons";
import React, { useCallback } from "react";
import { PlusIcon } from "lucide-react";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "../../../../../ui";
import {
  useCopyBlockIds,
  useCutBlockIds,
  useDuplicateBlocks,
  usePasteBlocks,
  useRemoveBlocks,
  useSelectedBlock,
  useSelectedBlockIds,
} from "../../../../hooks";
import { canAddChildBlock, canDeleteBlock, canDuplicateBlock } from "../../../../functions/block-helpers.ts";
import { useTranslation } from "react-i18next";
import { CHAI_BUILDER_EVENTS, emitChaiBuilderMsg } from "../../../../events.ts";

const CopyPasteBlocks = () => {
  const [selectedIds] = useSelectedBlockIds();
  const { canPaste, pasteBlocks } = usePasteBlocks();
  const [, setCopiedBlockIds] = useCopyBlockIds();
  const { t } = useTranslation();
  const selectedBlock = useSelectedBlock();

  return (
    <>
      <ContextMenuItem
        // @ts-ignore
        disabled={!canDuplicateBlock(selectedBlock?._type)}
        onClick={() => setCopiedBlockIds(selectedIds)}
        className="flex items-center gap-x-4 text-xs">
        <CopyIcon /> Copy
      </ContextMenuItem>
      {canPaste(selectedIds[0]) && (
        <ContextMenuItem
          // @ts-ignore
          className="flex items-center gap-x-4 text-xs"
          onClick={() => {
            pasteBlocks(selectedIds);
          }}>
          <CardStackIcon /> {t("Paste")}
        </ContextMenuItem>
      )}
    </>
  );
};

const CutBlocks = () => {
  const [selectedIds] = useSelectedBlockIds();
  const [, setCutBlockIds] = useCutBlockIds();
  const { t } = useTranslation();

  return (
    <ContextMenuItem className="flex items-center gap-x-4 text-xs" onClick={() => setCutBlockIds(selectedIds)}>
      <ScissorsIcon /> {t("Cut")}
    </ContextMenuItem>
  );
};

const RemoveBlocks = () => {
  const [selectedIds] = useSelectedBlockIds();
  const removeBlocks = useRemoveBlocks();
  const selectedBlock = useSelectedBlock();
  const { t } = useTranslation();

  return (
    <ContextMenuItem
      // @ts-ignore
      disabled={!canDeleteBlock(selectedBlock?._type)}
      className="flex items-center gap-x-4 text-xs"
      onClick={() => removeBlocks(selectedIds)}>
      <TrashIcon /> {t("Remove")}
    </ContextMenuItem>
  );
};

const BlockContextMenuContent = () => {
  const { t } = useTranslation();
  const [selectedIds] = useSelectedBlockIds();
  const duplicateBlocks = useDuplicateBlocks();
  const selectedBlock = useSelectedBlock();

  const duplicate = useCallback(() => {
    duplicateBlocks(selectedIds);
  }, [selectedIds, duplicateBlocks]);

  return (
    <ContextMenuContent className="border-border text-xs">
      <ContextMenuItem
        disabled={!canAddChildBlock(selectedBlock?._type)}
        className="flex items-center gap-x-4 text-xs"
        onClick={() => emitChaiBuilderMsg({ name: CHAI_BUILDER_EVENTS.OPEN_ADD_BLOCK, data: selectedBlock })}>
        <PlusIcon size={"14"} /> {t("Add block")}
      </ContextMenuItem>
      <ContextMenuItem
        disabled={!canDuplicateBlock(selectedBlock?._type)}
        className="flex items-center gap-x-4 text-xs"
        onClick={duplicate}>
        <CardStackPlusIcon /> {t("Duplicate")}
      </ContextMenuItem>
      <CutBlocks />
      <CopyPasteBlocks />
      <RemoveBlocks />
    </ContextMenuContent>
  );
};

export const BlockContextMenu = ({ children }: { children: React.ReactNode | null; id: any }) => {
  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <BlockContextMenuContent />
      </ContextMenu>
    </>
  );
};

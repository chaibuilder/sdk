import { CardStackIcon, CardStackPlusIcon, CopyIcon, ScissorsIcon, TrashIcon } from "@radix-ui/react-icons";
import React, { useCallback, useEffect } from "react";
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

export const PasteAtRootContextMenu = ({ parentContext, setParentContext }) => {
  const { t } = useTranslation();

  const { canPaste, pasteBlocks } = usePasteBlocks();

  useEffect(() => {
    if (!canPaste("root")) setParentContext(null);
  }, [canPaste("root")]);

  return (
    parentContext &&
    canPaste("root") && (
      <div
        style={{ position: "absolute", top: parentContext.y - 56, left: parentContext.x }}
        onMouseLeave={() => setParentContext(null)}
        className="w-28 rounded-md border bg-white p-1 shadow-xl">
        <div
          className="flex cursor-pointer items-center gap-x-4 rounded px-2 py-1 text-xs hover:bg-blue-50"
          onClick={() => pasteBlocks("root")}>
          <CardStackIcon /> {t("Paste")}
        </div>
      </div>
    )
  );
};

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

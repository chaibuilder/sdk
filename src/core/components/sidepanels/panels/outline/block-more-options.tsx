import { SaveToLibrary } from "@/core/components/sidepanels/panels/outline/save-to-library";
import { UnlinkLibraryBlock } from "@/core/components/sidepanels/panels/outline/unlink-library-block";
import { CHAI_BUILDER_EVENTS } from "@/core/events";
import { canAddChildBlock, canDeleteBlock, canDuplicateBlock } from "@/core/functions/block-helpers";
import {
  useBlocksStore,
  useCopyBlockIds,
  useCutBlockIds,
  useDuplicateBlocks,
  usePasteBlocks,
  useRemoveBlocks,
  useSelectedBlock,
  useSelectedBlockIds,
} from "@/core/hooks";
import { PERMISSIONS, usePermissions } from "@/core/main";
import { pubsub } from "@/core/pubsub";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/shadcn/components/ui/dropdown-menu";
import { CardStackIcon, CardStackPlusIcon, CopyIcon, ScissorsIcon, TrashIcon } from "@radix-ui/react-icons";
import { has, isEmpty } from "lodash-es";
import { PencilIcon, PlusIcon } from "lucide-react";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

const CopyPasteBlocks = () => {
  const [blocks] = useBlocksStore();
  const [selectedIds] = useSelectedBlockIds();
  const { pasteBlocks } = usePasteBlocks();
  const [, setCopiedBlockIds] = useCopyBlockIds();
  const { t } = useTranslation();
  const selectedBlock = useSelectedBlock();

  const handleCopy = useCallback(() => {
    const selectedBlocks = selectedIds.map((id) => {
      const block = blocks.find((b) => b._id === id);
      return {
        id,
        data: block,
      };
    });
    setCopiedBlockIds(selectedBlocks.map((block) => block.id));
  }, [selectedIds, blocks, setCopiedBlockIds]);

  return (
    <>
      <DropdownMenuItem
        disabled={!canDuplicateBlock(selectedBlock?._type)}
        onClick={handleCopy}
        className="flex items-center gap-x-4 text-xs">
        <CopyIcon /> {t("Copy")}
      </DropdownMenuItem>
      <DropdownMenuItem
        className="flex items-center gap-x-4 text-xs"
        onClick={() => {
          pasteBlocks(selectedIds);
        }}>
        <CardStackIcon /> {t("Paste")}
      </DropdownMenuItem>
    </>
  );
};

const CutBlocks = () => {
  const [selectedIds] = useSelectedBlockIds();
  const [, setCutBlockIds] = useCutBlockIds();
  const { t } = useTranslation();

  return (
    <DropdownMenuItem className="flex items-center gap-x-4 text-xs" onClick={() => setCutBlockIds(selectedIds)}>
      <ScissorsIcon /> {t("Cut")}
    </DropdownMenuItem>
  );
};

const RemoveBlocks = () => {
  const [selectedIds] = useSelectedBlockIds();
  const removeBlocks = useRemoveBlocks();
  const selectedBlock = useSelectedBlock();
  const { t } = useTranslation();

  return (
    <DropdownMenuItem
      // @ts-ignore
      disabled={!canDeleteBlock(selectedBlock?._type)}
      className="flex items-center gap-x-4 text-xs"
      onClick={() => removeBlocks(selectedIds)}>
      <TrashIcon /> {t("Remove")}
    </DropdownMenuItem>
  );
};

const RenameBlock = ({ node }: { node: any }) => {
  const { t } = useTranslation();
  return (
    <DropdownMenuItem
      onClick={(e) => {
        e.stopPropagation();
        node.edit();
        node.deselect();
      }}
      className="flex items-center gap-x-4 text-xs">
      <PencilIcon className="h-4 w-4" /> {t("Rename")}
    </DropdownMenuItem>
  );
};

const BlockContextMenuContent = ({ node }: { node: any }) => {
  const { t } = useTranslation();
  const [selectedIds] = useSelectedBlockIds();
  const duplicateBlocks = useDuplicateBlocks();
  const selectedBlock = useSelectedBlock();
  const { hasPermission } = usePermissions();

  const duplicate = useCallback(() => {
    duplicateBlocks(selectedIds);
  }, [selectedIds, duplicateBlocks]);

  const isLibLinkedBlock = useMemo(() => {
    return has(selectedBlock, "_libBlockId") && !isEmpty(selectedBlock._libBlockId);
  }, [selectedBlock?._libBlockId]);

  return (
    <DropdownMenuContent side="bottom" className="border-border text-xs">
      {hasPermission(PERMISSIONS.ADD_BLOCK) && (
        <>
          <DropdownMenuItem
            disabled={!canAddChildBlock(selectedBlock?._type)}
            className="flex items-center gap-x-4 text-xs"
            onClick={() => pubsub.publish(CHAI_BUILDER_EVENTS.OPEN_ADD_BLOCK, selectedBlock)}>
            <PlusIcon size={"14"} /> {t("Add block")}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!canDuplicateBlock(selectedBlock?._type)}
            className="flex items-center gap-x-4 text-xs"
            onClick={duplicate}>
            <CardStackPlusIcon /> {t("Duplicate")}
          </DropdownMenuItem>
        </>
      )}
      <RenameBlock node={node} />
      {hasPermission(PERMISSIONS.MOVE_BLOCK) && <CutBlocks />}
      {hasPermission(PERMISSIONS.ADD_BLOCK) && <CopyPasteBlocks />}
      {isLibLinkedBlock && <UnlinkLibraryBlock />}
      {hasPermission(PERMISSIONS.CREATE_LIBRARY_BLOCK) && <SaveToLibrary />}
      {hasPermission(PERMISSIONS.DELETE_BLOCK) && <RemoveBlocks />}
    </DropdownMenuContent>
  );
};

export const BlockMoreOptions = ({ children, id, node }: { children: React.ReactNode | null; id: any; node: any }) => {
  const [, setSelectedIds] = useSelectedBlockIds();
  return (
    <>
      <DropdownMenu
        onOpenChange={(open) => {
          if (open) setSelectedIds([id]);
        }}>
        <DropdownMenuTrigger>{children}</DropdownMenuTrigger>
        <BlockContextMenuContent node={node} />
      </DropdownMenu>
    </>
  );
};

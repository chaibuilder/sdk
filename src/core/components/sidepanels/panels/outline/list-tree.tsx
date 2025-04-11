import { useDebouncedCallback } from "@react-hookz/web";
import { useAtom } from "jotai";
import { find, first, isEmpty } from "lodash-es";
import { ChevronsDown, ChevronsUp, Eye, PlusIcon } from "lucide-react";
import { MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { MoveHandler, RenameHandler, Tree } from "react-arborist";
import { useTranslation } from "react-i18next";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "../../../../../ui/index.ts";
import { treeDSBlocks } from "../../../../atoms/blocks.ts";
import { treeRefAtom } from "../../../../atoms/ui.ts";
import { PERMISSIONS } from "../../../../constants/PERMISSIONS.ts";
import { ROOT_TEMP_KEY } from "../../../../constants/STRINGS.ts";
import { CHAI_BUILDER_EVENTS } from "../../../../events.ts";
import { canAcceptChildBlock } from "../../../../functions/block-helpers.ts";
import { cn } from "../../../../functions/Functions.ts";
import { useBlocksStoreUndoableActions } from "../../../../history/useBlocksStoreUndoableActions.ts";
import {
  useBlocksStore,
  useCutBlockIds,
  useHiddenBlockIds,
  usePermissions,
  useSelectedBlockIds,
  useSelectedStylingBlocks,
  useUpdateBlocksProps,
} from "../../../../hooks/index.ts";
import { pubsub } from "../../../../pubsub.ts";
import { PasteAtRootContextMenu } from "./block-more-options.tsx";
import { DefaultCursor } from "./default-cursor.tsx";
import { DefaultDragPreview } from "./default-drag-preview.tsx";
import {
  close,
  defaultShortcuts,
  open,
  selectFirst,
  selectLast,
  selectNext,
  selectParent,
  selectPrev,
} from "./default-shortcuts.tsx";
import { Node } from "./node.tsx";
import { SaveToLibraryModal } from "./upsert-library-block-modal.tsx";

const useCanMove = () => {
  const [blocks] = useBlocksStore();
  return (ids: string[], newParentId: string | null) => {
    const newParentType = find(blocks, { _id: newParentId })?._type;
    const blockType = first(ids.map((id) => find(blocks, { _id: id })?._type));
    return canAcceptChildBlock(newParentType, blockType);
  };
};

const ListTree = () => {
  const [treeData] = useAtom(treeDSBlocks);
  const [ids, setIds] = useSelectedBlockIds();
  const [cutBlocksIds] = useCutBlockIds();
  const [, setHiddenBlocks] = useHiddenBlockIds();
  const updateBlockProps = useUpdateBlocksProps();
  const [, setStyleBlocks] = useSelectedStylingBlocks();
  const { moveBlocks } = useBlocksStoreUndoableActions();
  const canMove = useCanMove();
  const treeRef = useRef(null);
  const [, setTreeRef] = useAtom(treeRefAtom);
  const { t } = useTranslation();
  const [parentContext, setParentContext] = useState(null);

  const clearSelection = () => {
    setIds([]);
    setStyleBlocks([]);
  };

  const filteredTreeData = useMemo(() => {
    const filterTreeData = (data, cutIds) => {
      return data
        .filter((node) => !cutIds.includes(node._id))
        .map((node) => ({
          ...node,
          children: node.children ? filterTreeData(node.children, cutIds) : [],
        }));
    };
    const nodes = filterTreeData(treeData, cutBlocksIds);
    return [...nodes, { _type: ROOT_TEMP_KEY, _id: ROOT_TEMP_KEY, children: [] }];
  }, [treeData, cutBlocksIds]);

  const onRename: RenameHandler<any> = ({ id, name, node }) => {
    updateBlockProps([id], { _name: name }, node.data._name);
  };
  const onMove: MoveHandler<any> = ({ dragIds, parentId, index }) => {
    if (canMove(dragIds, parentId)) moveBlocks(dragIds, parentId, index);
  };

  const onSelect = (nodes: any) => {
    if (nodes.length === 0) return;
    const nodeId = nodes[0] ? nodes[0].id : "";
    setStyleBlocks([]);
    setIds([nodeId]);
  };

  const onContextMenu = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (parentContext) setParentContext(null);

    const target = e.target as HTMLDivElement;
    const nodeId =
      target.getAttribute("data-node-id") || target.closest("[data-node-id]")?.getAttribute("data-node-id");
    if (nodeId) {
      setStyleBlocks([]);
      setIds([nodeId]);
    } else {
      setStyleBlocks([]);
      setIds([]);
      setParentContext({ x: e.clientX, y: e.clientY });
    }
  };

  const debouncedDisableDrop = useDebouncedCallback(
    ({ parentNode, dragNodes }) => {
      return (
        parentNode?.data._type === ROOT_TEMP_KEY ||
        !canAcceptChildBlock(parentNode?.data._type, dragNodes[0]?.data._type)
      );
    },
    [],
    300,
  );

  const handleKeyDown = (e) => {
    if (!treeRef.current) return;

    const tree = treeRef.current;
    const selectedNode = tree.selectedNodes[0];
    if (!selectedNode) return;

    setIds[selectedNode.id];
    setStyleBlocks([]);

    const isLeaf = !selectedNode.isInternal;
    const isClosed = !selectedNode.isOpen;
    const isOpen = selectedNode.isOpen;

    const shortcut = defaultShortcuts.find((s) => s.key === e.key && (!s.when || eval(s.when)));

    if (shortcut) {
      e.preventDefault();
      switch (shortcut.command) {
        case "selectNext":
          selectNext(tree);
          break;
        case "selectPrev":
          selectPrev(tree);
          break;
        case "selectParent":
          selectParent(tree, isLeaf || isClosed);
          break;
        case "close":
          close(tree, isOpen);
          break;
        case "open":
          open(tree, isClosed);
          break;
        case "selectFirst":
          selectFirst(tree);
          break;
        case "selectLast":
          selectLast(tree);
          break;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    const updateTreeRef = () => {
      if (treeRef.current) {
        //@ts-ignore
        setTreeRef(treeRef.current);
      }
    };
    //sets the ref once on mount if its available
    updateTreeRef();

    /**Sets up a MutationObserver to watch for DOM changes and try setting the ref again */
    const observer = new MutationObserver(updateTreeRef);
    observer.observe(document.body, { childList: true, subtree: true });

    //disconnect observer on unmount
    return () => observer.disconnect();
  }, [setTreeRef]);

  const { hasPermission } = usePermissions();

  if (isEmpty(treeData))
    return (
      <div>
        <div className="mt-10 flex h-full w-full items-center justify-center p-8 text-center">
          <p className="mb-1.5 text-sm text-gray-400">
            {t("This page is empty")}
            <br />
            <br />
            {hasPermission(PERMISSIONS.ADD_BLOCK) && (
              <Button
                disabled={!hasPermission(PERMISSIONS.ADD_BLOCK)}
                onClick={() => pubsub.publish(CHAI_BUILDER_EVENTS.OPEN_ADD_BLOCK)}
                variant="default"
                size="sm">
                + {t("Add Block")}
              </Button>
            )}
          </p>
        </div>
      </div>
    );

  return (
    <>
      <div className={cn("flex h-full select-none flex-col space-y-1")} onClick={() => clearSelection()}>
        <div
          id="outline-view"
          className="no-scrollbar h-full overflow-y-auto text-sm"
          onKeyDown={(e) => {
            if (!treeRef.current.isEditing) {
              handleKeyDown(e);
            }
          }}>
          <div className="mb-2 flex items-center justify-end gap-x-2 pb-2 text-sm text-muted-foreground">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setHiddenBlocks([])}
                  variant="outline"
                  className="h-fit p-1 disabled:cursor-not-allowed disabled:opacity-50"
                  size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="isolate z-[9999]">{t("Show hidden blocks")}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="h-fit p-1" onClick={() => treeRef?.current?.openAll()} variant="outline" size="sm">
                  <ChevronsDown size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="isolate z-[9999]">{t("Expand all")}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="h-fit p-1" onClick={() => treeRef?.current?.closeAll()} variant="outline" size="sm">
                  <ChevronsUp size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="isolate z-[9999]">{t("Collapse all")}</TooltipContent>
            </Tooltip>
          </div>
          <div className="group relative z-[9999] ml-5 w-full cursor-pointer">
            <div
              onClick={() => pubsub.publish(CHAI_BUILDER_EVENTS.OPEN_ADD_BLOCK, { position: 0 })}
              className="h-1 w-[90%] rounded bg-primary opacity-0 duration-200 group-hover:opacity-100">
              <div className="absolute left-[45%] top-1/2 flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full bg-primary p-1 outline outline-2 outline-white hover:bg-primary">
                <PlusIcon className="h-3 w-3 stroke-[3] text-white" />
              </div>
            </div>
          </div>
          <Tree
            ref={treeRef}
            height={window.innerHeight - 160}
            className="no-scrollbar !h-full max-w-full space-y-1 !overflow-y-auto !overflow-x-hidden"
            rowClassName="flex items-center h-full border-b border-transparent"
            selection={ids[0] || ""}
            onRename={onRename}
            openByDefault={false}
            onMove={onMove}
            data={[...filteredTreeData]}
            renderCursor={DefaultCursor}
            onSelect={onSelect}
            childrenAccessor={(d: any) => d.children}
            width={"100%"}
            rowHeight={28}
            renderDragPreview={DefaultDragPreview}
            indent={10}
            onContextMenu={onContextMenu}
            disableDrop={debouncedDisableDrop as any}
            idAccessor={"_id"}>
            {Node as any}
          </Tree>
        </div>
      </div>
      <PasteAtRootContextMenu parentContext={parentContext} setParentContext={setParentContext} />
      <SaveToLibraryModal />
    </>
  );
};

export default ListTree;

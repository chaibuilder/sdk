import React, { memo, MouseEvent, useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import { useDebouncedCallback } from "@react-hookz/web";
import { MoveHandler, NodeRendererProps, RenameHandler, Tree } from "react-arborist";
import { treeDSBlocks } from "../../../../../atoms/blocks.ts";
import { cn } from "../../../../../functions/Functions.ts";
import {
  useBlocksStore,
  useBuilderProp,
  useHighlightBlockId,
  useSelectedBlockIds,
  useSelectedStylingBlocks,
  useUpdateBlocksProps,
} from "../../../../../hooks";
import { TriangleRightIcon } from "@radix-ui/react-icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../../../ui";
import { TypeIcon } from "../TypeIcon.tsx";
import { DefaultCursor } from "./DefaultCursor.tsx";
import { DefaultDragPreview } from "./DefaultDragPreview.tsx";
import { useBlocksStoreUndoableActions } from "../../../../../history/useBlocksStoreUndoableActions.ts";
import { BlockContextMenu } from "../BlockContextMenu.tsx";
import { canAcceptChildBlock } from "../../../../../functions/block-helpers.ts";
import { find, first } from "lodash-es";
import { treeRefAtom } from "../../../../../atoms/ui.ts";
import {
  defaultShortcuts,
  selectFirst,
  selectLast,
  selectNext,
  selectPrev,
  selectParent,
  open,
  close,
} from "./DefaultShortcuts.tsx";

const Node = memo(({ node, style, dragHandle }: NodeRendererProps<any>) => {
  const outlineItems = useBuilderProp("outlineMenuItems", []);
  const [, setHighlighted] = useHighlightBlockId();

  const hasChildren = node.children.length > 0;

  const { id, data, isSelected, willReceiveDrop, isDragging, isEditing, handleClick } = node;

  const debouncedSetHighlighted = useDebouncedCallback((id) => setHighlighted(id), [], 300);

  const handleToggle = (event: any) => {
    event.stopPropagation();
    /*Toggle the node open and close State*/
    node.toggle();
  };

  const handleNodeClickWithoutPropagating = (e: any) => {
    /**
     * To stop propagation of the event to the parent
     * Tree Component to avoid clearing the selection of blocks
     * and allowing to select current block.
     */
    e.stopPropagation();
    if (!node.isOpen) node.toggle();
    /**
     * It will work when a node is clicked.
     * The onSelect in the parent Tree Component
     * will also trigger the selection of the node.
     */
    handleClick(e);
  };

  useEffect(() => {
    //TODO: Come back to this later. Might lead to a performance issue
    const timedToggle = setTimeout(() => {
      if (willReceiveDrop && !node.isOpen) {
        node.toggle();
      }
    }, 500);

    return () => clearTimeout(timedToggle);
  }, [willReceiveDrop, node]);

  return (
    <BlockContextMenu id={id}>
      <div
        onClick={handleNodeClickWithoutPropagating}
        onMouseEnter={() => debouncedSetHighlighted(id)}
        style={style}
        data-node-id={id}
        ref={dragHandle}
        className={cn(
          "group flex !h-fit w-full items-center justify-between space-x-px py-px outline-none",
          isSelected ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-800",
          willReceiveDrop && canAcceptChildBlock(data._type, "Icon") ? "bg-green-200" : "",
          isDragging && "opacity-20",
        )}>
        <div className="flex items-center">
          <div
            className={`flex h-4 w-4 rotate-0 transform cursor-pointer items-center justify-center text-xs transition-transform duration-100 ${
              node.isOpen ? "rotate-90" : ""
            }`}>
            {hasChildren && (
              <button onClick={handleToggle} type="button">
                <TriangleRightIcon />
              </button>
            )}
          </div>
          <div className="flex items-center">
            <div className="-mt-0.5 h-3 w-3">
              <TypeIcon type={data?._type} />
            </div>
            {isEditing ? (
              <Input node={node} />
            ) : (
              <div
                className="ml-2 truncate text-[11px]"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  node.edit();
                  node.deselect();
                }}>
                {data?._name || data?._type.split("/").pop()}
              </div>
            )}
          </div>
        </div>
        <div className="invisible flex items-center space-x-1 pr-2 group-hover:visible">
          {outlineItems.map((outlineItem) => (
            <Tooltip>
              <TooltipTrigger
                className="cursor-pointer rounded bg-transparent hover:bg-white hover:text-blue-500"
                asChild>
                {React.createElement(outlineItem.item, { blockId: id })}
              </TooltipTrigger>
              <TooltipContent className="z-[9999]">{outlineItem.tooltip}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </BlockContextMenu>
  );
});

const Input = ({ node }) => {
  return (
    <input
      autoFocus
      className="ml-2 w-full rounded-sm border border-black/30 bg-transparent px-1 text-[11px] outline-none"
      type="text"
      defaultValue={node.data?._name || node.data?._type}
      onFocus={(e) => e.currentTarget.select()}
      onBlur={(e) => node.submit(e.currentTarget.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") node.submit(e.currentTarget.value);
      }}
    />
  );
};
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
  const updateBlockProps = useUpdateBlocksProps();
  const [, setStyleBlocks] = useSelectedStylingBlocks();
  const { moveBlocks } = useBlocksStoreUndoableActions();
  const canMove = useCanMove();
  const treeRef = useRef(null);
  const [, setTreeRef] = useAtom(treeRefAtom);

  const clearSelection = () => {
    setIds([]);
    setStyleBlocks([]);
  };

  useEffect(() => {
    //@ts-ignore
    setTreeRef(treeRef.current);
  }, [treeRef.current]);

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
    const target = e.target as HTMLDivElement;
    const nodeId =
      target.getAttribute("data-node-id") || target.closest("[data-node-id]")?.getAttribute("data-node-id");
    if (nodeId) {
      setStyleBlocks([]);
      setIds([nodeId]);
    }
  };

  const debouncedDisableDrop = useDebouncedCallback(
    ({ parentNode, dragNodes }) => !canAcceptChildBlock(parentNode?.data._type, dragNodes[0]?.data._type),
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

  return (
    <div className={cn("-mx-1 -mt-1 flex h-full select-none flex-col space-y-1")} onClick={() => clearSelection()}>
      <div id="outline-view" className="no-scrollbar h-full overflow-y-auto p-1 px-2 text-xs" onKeyDown={handleKeyDown}>
        <Tree
          ref={treeRef}
          height={800}
          className="no-scrollbar !h-full max-w-full !overflow-y-auto !overflow-x-hidden"
          selection={ids[0] || ""}
          onRename={onRename}
          openByDefault={false}
          onMove={onMove}
          rowHeight={20}
          data={treeData}
          renderCursor={DefaultCursor}
          onSelect={onSelect}
          childrenAccessor={(d: any) => d.children}
          width={"100%"}
          renderDragPreview={DefaultDragPreview}
          indent={10}
          onContextMenu={onContextMenu}
          disableDrop={debouncedDisableDrop as any}
          idAccessor={"_id"}>
          {Node as any}
        </Tree>
      </div>
    </div>
  );
};

export default ListTree;

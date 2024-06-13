import { find, includes, isEmpty, isUndefined, map } from "lodash-es";
import * as React from "react";
import { BoxIcon, DoubleArrowDownIcon, StackIcon } from "@radix-ui/react-icons";
import { useDragLayer, useDrop } from "react-dnd";
import { NodeModel, Tree } from "@minoru/react-dnd-treeview";
import { useTranslation } from "react-i18next";
import { useSelectedBlockIds, useSelectedStylingBlocks } from "../../../../hooks";
import { CustomNode } from "./CustomNode";
import { CustomDragPreview } from "./CustomDragPreview";
import { Placeholder } from "./Placeholder";
import { canDropBlock } from "../../../../functions/block-helpers.ts";
import { useExpandedIds } from "../../../../hooks/useExpandTree";
import { ChaiBlock } from "../../../../types/ChaiBlock";
import { BlockContextMenu } from "./BlockContextMenu";
import { ScrollArea } from "../../../../../ui";
import { useAddBlockByDrop } from "../../../../hooks/useAddBlockByDrop";
import { cn } from "../../../../functions/Functions.ts";
import { useBlocksContainer } from "../../../../hooks/useBrandingOptions.ts";
import { useBlocksStore, useBlocksStoreUndoableActions } from "../../../../history/useBlocksStoreUndoableActions.ts";

function convertToTBlocks(newTree: NodeModel[]) {
  return map(newTree, (block) => {
    const { data } = block;
    return {
      ...(data as any),
      _parent: block.parent === 0 ? null : block.parent,
    } as ChaiBlock;
  });
}

function BlocksContainer() {
  const [container] = useBlocksContainer();
  const [ids, setSelected] = useSelectedBlockIds();
  if (!container) return null;
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setSelected(["container"]);
      }}
      className={cn(
        "flex items-center pl-2 text-xs",
        includes(ids, "container") ? "bg-blue-500 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-800",
      )}>
      <BoxIcon /> &nbsp;
      {container._type}
    </div>
  );
}

const Layers = (): React.JSX.Element => {
  const [allBlocks] = useBlocksStore();
  const { setNewBlocks: setAllBlocks } = useBlocksStoreUndoableActions();
  const [ids, setIds, toggleIds] = useSelectedBlockIds();
  const [, setStyleBlocks] = useSelectedStylingBlocks();
  const { t } = useTranslation();
  const expandedIds = useExpandedIds();
  const addBlockOnDrop = useAddBlockByDrop();
  const [blocksContainer] = useBlocksContainer();
  const handleDrop = async (newTree: NodeModel[], options: any) => {
    const { dragSource, relativeIndex, dropTargetId, monitor } = options;
    if (dragSource) {
      const blocks: ChaiBlock[] = convertToTBlocks(newTree);
      setAllBlocks(blocks);
      const block = monitor.getItem();
      setIds([block.id]);
    } else {
      await addBlockOnDrop({ block: monitor.getItem(), dropTargetId, relativeIndex });
    }
  };

  const treeBlocks: any = map(allBlocks, (block: ChaiBlock) => ({
    id: block._id,
    text: block._type,
    parent: block._parent || 0,
    droppable: !isUndefined(find(allBlocks, { _parent: block._id })),
    data: block,
  }));

  const clearSelection = () => {
    setIds([]);
    setStyleBlocks([]);
  };

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ["CHAI_BLOCK"],
    collect: (monitor) => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver(),
    }),
    drop: (item: any) => {
      (async () => {
        await addBlockOnDrop({
          block: item,
          dropTargetId: "",
          relativeIndex: 0,
        });
      })();
    },
  }));

  const { isDragging } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
  }));

  return (
    <>
      <div
        onClick={() => clearSelection()}
        className={cn(
          "-mx-1 -mt-1 flex h-full select-none flex-col space-y-1",
          isDragging ? "bg-green-50/80" : "bg-background",
        )}>
        {isEmpty(allBlocks) ? (
          <div
            ref={drop}
            className={`mx-1 mt-4 h-full max-w-full p-6 text-center text-sm text-gray-400 ${
              isOver ? "bg-blue-200" : ""
            }`}>
            {isOver ? (
              <DoubleArrowDownIcon className="mx-auto h-12 w-12 animate-bounce" />
            ) : (
              <StackIcon className="mx-auto h-10 w-10" />
            )}
            <p className="mt-2">{t(isOver ? "drop_here_message" : "tree_view_no_blocks")}</p>
          </div>
        ) : (
          <ScrollArea id="layers-view" className="no-scrollbar h-full overflow-y-auto p-1">
            <BlocksContainer />
            <Tree
              initialOpen={expandedIds}
              extraAcceptTypes={["CHAI_BLOCK"]}
              tree={treeBlocks}
              rootId={0}
              render={(node, { depth, isOpen, onToggle }) => (
                <BlockContextMenu id={node.id}>
                  <CustomNode
                    onSelect={(id: string) => {
                      setStyleBlocks([]);
                      setIds([id]);
                    }}
                    isSelected={includes(ids, node.id)}
                    node={node}
                    depth={depth}
                    isOpen={isOpen}
                    onToggle={onToggle}
                    toggleIds={toggleIds}
                  />
                </BlockContextMenu>
              )}
              dragPreviewRender={(monitorProps) => <CustomDragPreview monitorProps={monitorProps} />}
              onDrop={handleDrop}
              classes={{
                root: "h-[90%] " + (blocksContainer ? "pl-2" : "pt-2"),
                draggingSource: "opacity-30",
                dropTarget: "bg-green-100",
                placeholder: "relative",
              }}
              sort={false}
              insertDroppableFirst={false}
              canDrop={canDropBlock}
              dropTargetOffset={2}
              enableAnimateExpand={true}
              placeholderRender={(node, { depth }) => <Placeholder node={node} depth={depth} />}
            />
          </ScrollArea>
        )}
      </div>
    </>
  );
};

export default Layers;

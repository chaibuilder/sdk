import { Tree } from "react-arborist";
import { cn } from "../../../../../functions/Functions.ts";
import {
  useBuilderProp,
  useHighlightBlockId,
  useSelectedBlockIds,
  useSelectedStylingBlocks,
} from "../../../../../hooks";
import { ScrollArea, Tooltip, TooltipContent, TooltipTrigger } from "../../../../../../ui";
import { TypeIcon } from "../TypeIcon.tsx";
import { useDebouncedCallback } from "@react-hookz/web";
import { TriangleRightIcon } from "@radix-ui/react-icons";
import { useAtom } from "jotai";
import { treeDSBlocks } from "../../../../../atoms/blocks.ts";

const removeDuplicates = (nodes, seen = new Set()) => {
  return nodes.reduce((acc, node) => {
    if (!seen.has(node._id)) {
      seen.add(node._id);
      const children = node.children ? removeDuplicates(node.children, seen) : [];
      acc.push({ ...node, children });
    }
    return acc;
  }, []);
};

function Node({ node, style, dragHandle }) {
  const [, setHighlighted] = useHighlightBlockId();
  const outlineItems = useBuilderProp("outlineMenuItems", []);

  const { id, isSelected, data, handleClick } = node;

  const debouncedSetHighlighted = useDebouncedCallback((id) => setHighlighted(id), [], 300);

  const handleToggle = (event: any) => {
    event.stopPropagation();
    /**
     * Toggle the node open and close State
     */
    node.toggle();
  };

  const handleClearSelection = (e: any) => {
    /**
     * To stop propagation of the event to the parent
     * Tree Component to avoid clearing the selection of blocks
     * and allowing to select other blocks
     */
    e.stopPropagation();
    /**
     * It will work when a node is clicked.
     * The onSelect in the parent Tree Component
     * will also trigger the selection of the node.
     */
    handleClick(e);
  };

  return (
    <div
      onClick={handleClearSelection}
      key={id}
      onMouseEnter={() => debouncedSetHighlighted(id)}
      style={style}
      ref={dragHandle}
      className={cn(
        "group relative flex !h-fit w-full items-center justify-between space-x-px overflow-hidden py-px",
        isSelected ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-800",
      )}>
      <div className="flex items-center">
        <div
          className={`flex h-4 w-4 rotate-0 transform cursor-pointer items-center justify-center text-xs transition-transform duration-100 ${
            node.isOpen ? "rotate-90" : ""
          }`}>
          {node.children?.length > 0 && (
            <button onClick={handleToggle} type="button">
              <TriangleRightIcon />
            </button>
          )}
        </div>
        <button type="button" className="flex items-center">
          <div className="-mt-0.5 h-3 w-3">
            <TypeIcon type={data?._type} />
          </div>
          <div className="ml-2 truncate text-[11px]">{data?._type}</div>
        </button>
      </div>
      <div className="invisible flex items-center space-x-1 pr-2 group-hover:visible">
        {outlineItems.map((outlineItem) => (
          <Tooltip>
            <TooltipTrigger
              className="cursor-pointer rounded bg-transparent hover:bg-white hover:text-blue-500"
              asChild>
              {outlineItem.item(id)}
            </TooltipTrigger>
            <TooltipContent className="z-[9999]">{outlineItem.tooltip}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}

const ListTree = () => {
  const [treeData] = useAtom(treeDSBlocks);

  const [ids, setIds] = useSelectedBlockIds();
  const [, setStyleBlocks] = useSelectedStylingBlocks();

  const clearSelection = () => {
    setIds([]);
    setStyleBlocks([]);
  };

  const onRename = ({ id, name }) => {
    console.log("onRename", { id, name });
  };
  const onMove = ({ dragIds, parentId, index }) => {
    console.log("onMove", { dragIds, parentId, index });
  };
  const onDelete = ({ ids }) => {
    console.log("onDelete", { ids });
  };

  const onSelect = (nodes: any) => {
    if (nodes.length === 0) return;
    const nodeId = nodes[0] ? nodes[0].id : "";
    setStyleBlocks([]);
    setIds([nodeId]);
  };

  return (
    <div className={cn("-mx-1 -mt-1 flex h-full select-none flex-col space-y-1")} onClick={() => clearSelection()}>
      <ScrollArea id="outline-view" className="no-scrollbar h-full overflow-y-auto p-1 px-2 text-xs">
        <Tree
          className="max-w-full !overflow-hidden"
          selection={ids[0] || ""}
          onRename={onRename}
          openByDefault={false}
          onMove={onMove}
          rowHeight={20}
          onDelete={onDelete}
          data={treeData}
          width={"100%"}
          indent={10}
          idAccessor={"_id"}
          onSelect={onSelect}>
          {Node as any}
        </Tree>
      </ScrollArea>
    </div>
  );
};

export default ListTree;

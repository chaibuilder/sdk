import { Tree } from "react-arborist";
import { cn } from "../../../../../functions/Functions.ts";
import { useSelectedBlockIds, useSelectedStylingBlocks } from "../../../../../hooks";
import { ScrollArea } from "../../../../../../ui";

const data = [
  { id: "1", name: "Unread" },
  { id: "2", name: "Threads" },
  {
    id: "3",
    name: "Chat Rooms",
    children: [
      { id: "c1", name: "General" },
      { id: "c2", name: "Random" },
      { id: "c3", name: "Open Source Projects" },
    ],
  },
  {
    id: "4",
    name: "Direct Messages",
    children: [
      { id: "d1", name: "Alice" },
      { id: "d2", name: "Bob" },
      { id: "d3", name: "Charlie" },
    ],
  },
];

function Node({ node, style, dragHandle }) {
  /* This node instance can do many things. See the API reference. */
  return (
    <div style={style} ref={dragHandle}>
      {node.isLeaf ? "🍁" : "🗀"}
      {node.data.name}
    </div>
  );
}

const ListTree = () => {
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

  return (
    <div onClick={() => clearSelection()} className={cn("-mx-1 -mt-1 flex h-full select-none flex-col space-y-1")}>
      <ScrollArea id="layers-view" className="no-scrollbar h-full overflow-y-auto p-1 px-2 text-xs">
        <Tree
          selection={ids[0] || ""}
          onRename={onRename}
          onMove={onMove}
          onDelete={onDelete}
          data={data}
          idAccessor={"id"}
          childrenAccessor={(d) => d.children}>
          {Node as any}
        </Tree>
      </ScrollArea>
    </div>
  );
};

export default ListTree;

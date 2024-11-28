import { useAddBlock, useBlocksStore, useSelectedBlock, useWrapperBlock } from "../hooks";
import { filter } from "lodash-es";
import { size } from "lodash";
import { Badge } from "../../ui";
import { Plus } from "lucide-react";

const RowColField = () => {
  const selectedBlock = useSelectedBlock();
  const wrapperBlock = useWrapperBlock();
  const [blocks] = useBlocksStore();
  const { addCoreBlock } = useAddBlock();

  if (!selectedBlock && !wrapperBlock) return null;

  const rowBlock = selectedBlock?._type === "Row" ? selectedBlock : wrapperBlock;
  const columnCounts = size(filter(blocks, { _parent: rowBlock?._id }));

  return (
    <div className="pt-1">
      {columnCounts > 11 && (
        <div className="text-[9px] leading-tight text-slate-400">Max limit reached. Only 12 columns allowed.</div>
      )}
      <div className="flex items-center gap-x-2 pt-1">
        <Badge className="flex h-[22px] items-center justify-center rounded p-0 px-2 text-[14px]">{columnCounts}</Badge>
        <button
          type="button"
          disabled={columnCounts > 11}
          className={`duratiom-300 flex items-center gap-x-1 rounded px-3 py-1 text-[11px] font-medium leading-tight ${columnCounts > 11 ? "cursor-not-allowed bg-gray-300 text-gray-500" : "border border-gray-400 bg-gray-100 hover:bg-slate-200"}`}
          onClick={() => addCoreBlock({ type: "Column", styles: "#styles:," }, rowBlock?._id)}>
          <Plus className="h-4 w-4" /> Add Column
        </button>
      </div>
    </div>
  );
};

export { RowColField };

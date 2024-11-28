import { useAddBlock, useSelectedBlock, useWrapperBlock } from "../hooks";
import { Plus } from "lucide-react";

const RowColField = () => {
  const selectedBlock = useSelectedBlock();
  const wrapperBlock = useWrapperBlock();
  const { addCoreBlock } = useAddBlock();

  if (!selectedBlock && !wrapperBlock) return null;

  const rowBlock = selectedBlock?._type === "Row" ? selectedBlock : wrapperBlock;

  return (
    <div className="pt-1">
      <button
        type="button"
        className={`duratiom-300 flex items-center gap-x-1 rounded border border-gray-400 bg-gray-100 px-4 py-1 text-[11px] font-medium leading-tight hover:bg-slate-200`}
        onClick={() => addCoreBlock({ type: "Column", styles: "#styles:," }, rowBlock?._id)}>
        <Plus className="h-4 w-4" /> Add Column
      </button>
    </div>
  );
};

export { RowColField };

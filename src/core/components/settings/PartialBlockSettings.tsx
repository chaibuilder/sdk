import { get, startCase } from "lodash-es";
import { usePartialBlocksList, useSelectedBlock, useUpdateBlocksProps } from "../../hooks";

export const GlobalBlockSettings = () => {
  const selectedBlock = useSelectedBlock() as any;
  const { data: list, refetch, isLoading } = usePartialBlocksList();
  const updateBlockProps = useUpdateBlocksProps();
  return (
    <div>
      <label className="text-sm">Choose a partial block</label>
      <select
        className="h-8 w-full rounded-md border border-border bg-gray-50 p-0 px-2 text-xs dark:bg-gray-800"
        value={selectedBlock?.partialBlockId || ""}
        onChange={(e) => {
          updateBlockProps([selectedBlock._id], {
            partialBlockId: e.target.value,
            _name: `Partial: ${startCase(get(list, e.target.value, "")?.name)}`,
          });
        }}>
        <option value="">Select a partial block</option>
        {Object.keys(list).map((key) => (
          <option key={key} value={key}>
            {list[key].name || key}
          </option>
        ))}
      </select>
      <div className={"mt-2 text-xs"}>
        <button
          onClick={refetch}
          className="rounded-md bg-gray-100 p-1 px-2 text-xs hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">
          {isLoading ? "Loading..." : "Refresh List"}
        </button>
      </div>
    </div>
  );
};

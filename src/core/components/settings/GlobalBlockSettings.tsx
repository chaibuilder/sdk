import { useGlobalBlocksList, useSelectedBlock, useUpdateBlocksProps } from "../../hooks";
import { startCase } from "lodash-es";

export const GlobalBlockSettings = () => {
  const selectedBlock = useSelectedBlock() as any;
  const { data: list, refetch, isLoading } = useGlobalBlocksList();
  const updateBlockProps = useUpdateBlocksProps();
  return (
    <div>
      <label className="text-sm">Choose a global block</label>
      <select
        className="h-8 w-full rounded-md border border-border bg-gray-50 p-0 px-2 text-xs dark:bg-gray-800"
        value={selectedBlock?.globalBlock || ""}
        onChange={(e) => {
          updateBlockProps([selectedBlock._id], {
            globalBlock: e.target.value,
            _name: `Global: ${startCase(e.target.value)}`,
          });
        }}>
        <option value="">Select a global block</option>
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

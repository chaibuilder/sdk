import { useSelectedBlock, useUpdateBlocksProps } from "../../hooks";
import { useGlobalBlocksList } from "../../hooks/useGlobalBlocksStore.ts";
import { Button } from "../../../ui";

export const GlobalBlockSettings = () => {
  const selectedBlock = useSelectedBlock() as any;
  const { data: list, refetch, isLoading } = useGlobalBlocksList();
  const updateBlockProps = useUpdateBlocksProps();
  return (
    <div>
      <label className="text-sm">Choose a global block</label>
      <select
        className="h-8 w-full rounded-md border border-gray-300 p-0 px-2 text-xs dark:border-gray-600"
        value={selectedBlock?.globalBlock || ""}
        onChange={(e) => {
          updateBlockProps([selectedBlock._id], { globalBlock: e.target.value });
        }}>
        <option value="">Select a global block</option>
        {Object.keys(list).map((key) => (
          <option key={key} value={key}>
            {list[key].name || key}
          </option>
        ))}
      </select>
      <div className={"mt-2 text-xs"}>
        <Button size={"sm"} variant={"outline"} onClick={refetch} className="text-xs">
          {isLoading ? "Loading..." : "Refresh List"}
        </Button>
      </div>
    </div>
  );
};

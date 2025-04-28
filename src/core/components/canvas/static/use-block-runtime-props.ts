import { useBlocksStore } from "@/core/hooks/hooks";
import { find, get, isEmpty } from "lodash-es";
import { useCallback } from "react";

export const useBlockRuntimeProps = () => {
  const [allBlocks] = useBlocksStore();
  return useCallback(
    (blockId: string, runtimeProps: Record<string, any>) => {
      if (isEmpty(runtimeProps)) return {};
      return Object.entries(runtimeProps).reduce((acc, [key, schema]) => {
        const hierarchy = [];
        let block = find(allBlocks, { _id: blockId });
        while (block) {
          hierarchy.push(block);
          block = find(allBlocks, { _id: block._parent });
        }
        const matchingBlock = find(hierarchy, { _type: schema.block });
        if (matchingBlock) {
          acc[key] = get(matchingBlock, get(schema, "prop"), null);
        }
        return acc;
      }, {});
    },
    [allBlocks],
  );
};

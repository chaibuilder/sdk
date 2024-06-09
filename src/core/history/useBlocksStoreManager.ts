import { ChaiBlock } from "../types/ChaiBlock.ts";
import { map } from "lodash-es";
import { useBlocksStore } from "./blocks.ts";

export const useBlocksStoreManager = () => {
  const [, setBlocks] = useBlocksStore();

  return {
    addBlocks: (newBlocks: ChaiBlock[], parent?: string, position?: number) => {
      setBlocks((prevBlocks) => {
        prevBlocks = [...prevBlocks, ...newBlocks];
        return prevBlocks;
      });
    },
    removeBlocks: (blocks: ChaiBlock[]) => {
      setBlocks((prevBlocks) => {
        return prevBlocks.filter((block) => !map(blocks, "_id").includes(block._id));
      });
    },
  };
};

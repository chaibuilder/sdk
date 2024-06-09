import { ChaiBlock } from "../types/ChaiBlock.ts";
import { useBlocksStore } from "./useBlocksStoreActions.ts";
import { find, map, omit } from "lodash";

export const useBlocksStoreManager = () => {
  const [, setBlocks] = useBlocksStore();

  return {
    setNewBlocks: (newBlocks: ChaiBlock[]) => {
      setBlocks(newBlocks);
    },
    addBlocks: (newBlocks: ChaiBlock[], parent?: string, position?: number) => {
      //FIXME: add parent and position logic
      setBlocks((prevBlocks) => {
        prevBlocks = [...prevBlocks, ...newBlocks];
        return prevBlocks;
      });
    },
    removeBlocks: (blocks: ChaiBlock[]) => {
      //FIXME: handle nested children blocks
      setBlocks((prevBlocks) => prevBlocks.filter((block) => !map(blocks, "_id").includes(block._id)));
    },
    updateBlocksProps: (blocks: ChaiBlock[]) => {
      setBlocks((prevBlocks: ChaiBlock[]) => {
        const blocksIds = blocks.map((block) => block._id);
        return prevBlocks.map((block) => {
          if (blocksIds.includes(block._id)) {
            const props = find(blocks, { _id: block._id });
            return { ...block, ...omit(props, "_id") };
          }
          return block;
        });
      });
    },
  };
};

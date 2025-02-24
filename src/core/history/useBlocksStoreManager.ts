import { omit } from "lodash-es";
import { useUpdateBlockAtom } from "../components/canvas/static/useUpdateBlockAtom.ts";
import { removeNestedBlocks } from "../hooks/useRemoveBlocks.ts";
import { ChaiBlock } from "../types/ChaiBlock.ts";
import { insertBlocksAtPosition } from "./InsertBlocksAtPosition.ts";
import { moveBlocksWithChildren } from "./moveBlocksWithChildren.ts";
import { useBlocksStore } from "./useBlocksStoreUndoableActions.ts";

export const useBlocksStoreManager = () => {
  const [, setBlocks] = useBlocksStore();
  const updateBlockAtom = useUpdateBlockAtom();
  return {
    setNewBlocks: (newBlocks: ChaiBlock[]) => {
      setBlocks(newBlocks);
    },
    addBlocks: (newBlocks: ChaiBlock[], parent?: string, position?: number) => {
      setBlocks((prevBlocks) => insertBlocksAtPosition(prevBlocks, newBlocks, parent, position));
    },
    removeBlocks: (blockIds: string[]) => {
      setBlocks((prevBlocks) => removeNestedBlocks(prevBlocks, blockIds));
    },
    moveBlocks: (blockIds: string[], newParent: string | null, position: number) => {
      setBlocks((prevBlocks) => {
        let blocks = prevBlocks;
        for (let i = 0; i < blockIds.length; i++) {
          blocks = moveBlocksWithChildren(blocks, blockIds[i], newParent, position);
        }
        return blocks;
      });
    },
    updateBlocksProps: (blocks: Partial<ChaiBlock>[]) => {
      blocks.forEach((block) => {
        const updatedBlock = omit(block, "_id");
        updateBlockAtom({ id: block._id, props: updatedBlock });
      });
    },
  };
};

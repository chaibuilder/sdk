import { omit } from "lodash-es";
import { useAtomSetterCb } from "../hooks/useAtomSetterCb.ts";
import { useBroadcastChannel } from "../hooks/useBroadcastChannel.ts";
import { removeNestedBlocks } from "../hooks/useRemoveBlocks.ts";
import { ChaiBlock } from "../types/ChaiBlock.ts";
import { insertBlocksAtPosition } from "./InsertBlocksAtPosition.ts";
import { moveBlocksWithChildren } from "./moveBlocksWithChildren.ts";
import { useBlocksStore } from "./useBlocksStoreUndoableActions.ts";

export const useBlocksStoreManager = () => {
  const [, setBlocks] = useBlocksStore();
  const { postMessage } = useBroadcastChannel();
  const atomSetterCb = useAtomSetterCb();
  return {
    setNewBlocks: (newBlocks: ChaiBlock[]) => {
      setBlocks(newBlocks);
      postMessage({ type: "blocks-updated", blocks: newBlocks });
    },
    addBlocks: (newBlocks: ChaiBlock[], parent?: string, position?: number) => {
      setBlocks((prevBlocks) => {
        const blocks = insertBlocksAtPosition(prevBlocks, newBlocks, parent, position);
        postMessage({ type: "blocks-updated", blocks });
        return blocks;
      });
    },
    removeBlocks: (blockIds: string[]) => {
      setBlocks((prevBlocks) => {
        const blocks = removeNestedBlocks(prevBlocks, blockIds);
        postMessage({ type: "blocks-updated", blocks });
        return blocks;
      });
    },
    moveBlocks: (blockIds: string[], newParent: string | null, position: number) => {
      setBlocks((prevBlocks) => {
        let blocks = prevBlocks;
        for (let i = 0; i < blockIds.length; i++) {
          blocks = moveBlocksWithChildren(blocks, blockIds[i], newParent, position);
        }
        postMessage({ type: "blocks-updated", blocks });
        return blocks;
      });
    },
    updateBlocksProps: (blocks: Partial<ChaiBlock>[]) => {
      blocks.forEach((block) => {
        atomSetterCb(block._id)({ ...block, ...omit(block, "_id") });
      });
      postMessage({ type: "blocks-props-updated", blocks });
    },
  };
};

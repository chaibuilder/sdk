import { omit } from "lodash-es";
import { ChaiBuilderBlockWithAtom } from "../atoms/blocks.ts";
import { useBroadcastChannel } from "../hooks/useBroadcastChannel.ts";
import { removeNestedBlocks } from "../hooks/useRemoveBlocks.ts";
import { useUpdateBlockAtom } from "../hooks/useUpdateBlockAtom.ts";
import { ChaiBlock } from "../types/ChaiBlock.ts";
import { insertBlocksAtPosition } from "./InsertBlocksAtPosition.ts";
import { moveBlocksWithChildren } from "./moveBlocksWithChildren.ts";
import { useBlocksStore } from "./useBlocksStoreUndoableActions.ts";

export const useBlocksStoreManager = () => {
  const [, setBlocks] = useBlocksStore();
  const { postMessage } = useBroadcastChannel();
  const updateBlockAtom = useUpdateBlockAtom();
  return {
    setNewBlocks: (newBlocks: ChaiBuilderBlockWithAtom[]) => {
      setBlocks(newBlocks);
      postMessage({ type: "blocks-updated", blocks: newBlocks });
    },
    addBlocks: (newBlocks: ChaiBuilderBlockWithAtom[], parent?: string, position?: number) => {
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
          blocks = moveBlocksWithChildren(blocks, blockIds[i], newParent, position, updateBlockAtom);
        }
        postMessage({ type: "blocks-updated", blocks });
        return blocks;
      });
    },
    updateBlocksProps: (blocks: Partial<ChaiBlock>[]) => {
      blocks.forEach((block) => {
        const updatedBlock = omit(block, "_id");
        updateBlockAtom({ id: block._id, props: updatedBlock });
      });
      postMessage({ type: "blocks-props-updated", blocks });
    },
  };
};

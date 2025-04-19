import { insertBlocksAtPosition } from "@/core/history/InsertBlocksAtPosition";
import { moveBlocksWithChildren } from "@/core/history/moveBlocksWithChildren";
import { useBlocksStore } from "@/core/history/useBlocksStoreUndoableActions";
import { useBroadcastChannel } from "@/core/hooks/useBroadcastChannel";
import { removeNestedBlocks } from "@/core/hooks/useRemoveBlocks";
import { useUpdateBlockAtom } from "@/core/hooks/useUpdateBlockAtom";
import { ChaiBlock } from "@/types/chai-block";
import { each, find, omit } from "lodash-es";

export const useBlocksStoreManager = () => {
  const [, setBlocks] = useBlocksStore();
  const { postMessage } = useBroadcastChannel();
  const updateBlockAtom = useUpdateBlockAtom();
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
        let blocks = [...prevBlocks];
        for (let i = 0; i < blockIds.length; i++) {
          blocks = moveBlocksWithChildren(blocks, blockIds[i], newParent, position);
        }
        each(blockIds, (id: string) => {
          const block = find(blocks, (b) => b._id === id);
          if (block) {
            updateBlockAtom({ id, props: { _parent: block._parent || null } });
          }
        });
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

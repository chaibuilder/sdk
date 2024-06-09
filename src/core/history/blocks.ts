import { useAtom } from "jotai";
import { presentBlocksAtom } from "../atoms/blocks.ts";
import { ChaiBlock } from "../types/ChaiBlock.ts";
import { useUndoManager } from "./useUndoManager.ts";
import { useBlocksStoreManager } from "./useBlocksStoreManager.ts";
import { first } from "lodash-es";

export const useBlocksStore = () => {
  return useAtom(presentBlocksAtom);
};

export const useBlocksStoreActions = () => {
  const { add } = useUndoManager();
  const [currentBlocks] = useBlocksStore();
  const { addBlocks: addNewBlocks, removeBlocks: removeExistingBlocks } = useBlocksStoreManager();

  const addBlocks = (newBlocks: ChaiBlock[], parent?: string, position?: number) => {
    addNewBlocks(newBlocks, parent, position);
    add({
      undo: () => removeExistingBlocks(newBlocks),
      redo: () => addNewBlocks(newBlocks, parent, position),
    });
  };

  const removeBlocks = (blocks: ChaiBlock[]) => {
    const parentId = first(blocks)?._parent;
    const siblings = currentBlocks.filter((block) => block._parent === parentId);
    const position = siblings.indexOf(first(blocks));
    removeExistingBlocks(blocks);
    add({
      undo: () => addNewBlocks(blocks, parentId, position),
      redo: () => removeExistingBlocks(blocks),
    });
  };

  const updateBlocks = (blockIds: string[], props: Record<string, any>) => {
    console.log("updateBlocks", blockIds, props);
    add({
      undo: () => {
        console.log("undo updateBlocks", blockIds, props);
      },
      redo: () => {
        console.log("redo updateBlocks", blockIds, props);
      },
    });
  };

  const updateBlocksRuntime = (blockIds: string[], props: Record<string, any>) => {
    console.log("updateBlocks runtime", blockIds, props);
  };

  return {
    addBlocks,
    removeBlocks,
    updateBlocks,
    updateBlocksRuntime,
  };
};

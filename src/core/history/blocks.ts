import { useAtom } from "jotai";
import { presentBlocksAtom } from "../atoms/blocks.ts";
import { ChaiBlock } from "../types/ChaiBlock.ts";
import { useUndoManager } from "./useUndoManager.ts";

export const useBlocksStore = () => {
  return useAtom(presentBlocksAtom);
};

export const useBlocksStoreActions = () => {
  const { undoManager } = useUndoManager();
  const addBlocks = (blocks: ChaiBlock[], parent?: string, position?: number) => {
    console.log("addBlocks", blocks, parent, position);
    undoManager.add({
      undo: () => {
        console.log("undo addBlocks", blocks, parent, position);
      },
      redo: () => {
        console.log("redo addBlocks", blocks, parent, position);
      },
    });
  };

  const removeBlocks = (blocks: ChaiBlock[]) => {
    console.log("removeBlocks", blocks);
    undoManager.add({
      undo: () => {
        console.log("undo remove blocks", blocks, "parent", "index");
      },
      redo: () => {
        console.log("redo remove", blocks);
      },
    });
  };

  const updateBlocks = (blockIds: string[], props: Record<string, any>) => {
    console.log("updateBlocks", blockIds, props);
    undoManager.add({
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

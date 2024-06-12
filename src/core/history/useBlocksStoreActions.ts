import { useAtom } from "jotai";
import { presentBlocksAtom } from "../atoms/blocks.ts";
import { ChaiBlock } from "../types/ChaiBlock.ts";
import { useUndoManager } from "./useUndoManager.ts";
import { useBlocksStoreManager } from "./useBlocksStoreManager.ts";
import { each, first, keys, map } from "lodash-es";

export const useBlocksStore = () => {
  return useAtom(presentBlocksAtom);
};

export const useBlocksStoreActions = () => {
  const { add } = useUndoManager();
  const [currentBlocks] = useBlocksStore();
  const {
    setNewBlocks: setBlocks,
    addBlocks: addNewBlocks,
    removeBlocks: removeExistingBlocks,
    updateBlocksProps,
  } = useBlocksStoreManager();

  const setNewBlocks = (newBlocks: ChaiBlock[]) => {
    setBlocks(newBlocks);
    add({
      undo: () => setBlocks(currentBlocks),
      redo: () => setBlocks(newBlocks),
    });
  };

  const addBlocks = (newBlocks: ChaiBlock[], parent?: string, position?: number) => {
    addNewBlocks(newBlocks, parent, position);
    add({
      undo: () => removeExistingBlocks(map(newBlocks, "_id")),
      redo: () => addNewBlocks(newBlocks, parent, position),
    });
  };

  const removeBlocks = (blocks: ChaiBlock[]) => {
    const parentId = first(blocks)?._parent;
    const siblings = currentBlocks.filter((block) => (parentId ? block._parent === parentId : !block._parent));
    const position = siblings.indexOf(first(blocks));

    removeExistingBlocks(map(blocks, "_id"));
    add({
      undo: () => addNewBlocks(blocks, parentId, position),
      redo: () => removeExistingBlocks(map(blocks, "_id")),
    });
  };

  const updateBlocks = (blockIds: string[], props: Partial<ChaiBlock>, oldPropsState?: Partial<ChaiBlock>) => {
    let previousPropsState = [];
    if (oldPropsState) {
      previousPropsState = map(blockIds, (_id: string) => {
        return { _id, ...oldPropsState };
      });
    } else {
      const propKeys = keys(props);
      previousPropsState = map(blockIds, (_id: string) => {
        const block = currentBlocks.find((block) => block._id === _id);
        const prevProps = { _id };
        each(propKeys, (key: string) => (prevProps[key] = block[key]));
        return prevProps;
      });
    }

    updateBlocksProps(map(blockIds, (_id: string) => ({ _id, ...props })));
    add({
      undo: () => updateBlocksProps(previousPropsState),
      redo: () => updateBlocksProps(map(blockIds, (_id: string) => ({ _id, ...props }))),
    });
  };

  const updateBlocksRuntime = (blockIds: string[], props: Record<string, any>) => {
    updateBlocksProps(map(blockIds, (_id: string) => ({ _id, ...props })));
  };

  return {
    addBlocks,
    removeBlocks,
    updateBlocks,
    updateBlocksRuntime,
    setNewBlocks,
  };
};

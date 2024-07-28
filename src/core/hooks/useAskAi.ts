import { filter, find, flattenDeep } from "lodash-es";
import { useBuilderProp } from "./useBuilderProp.ts";
import { useCallback, useState } from "react";
import { useBlocksStore } from "../history/useBlocksStoreUndoableActions.ts";
import { ChaiBlock } from "../types/ChaiBlock.ts";
import { useUpdateMultipleBlocksProps } from "./useUpdateBlocksProps.ts";
import { atom, useAtom } from "jotai";
import { cloneDeep, set } from "lodash";

function getChildBlocks(allBlocks: ChaiBlock[], blockId: string, blocks: any[]) {
  blocks.push(find(allBlocks, { _id: blockId }) as ChaiBlock);
  const children = filter(allBlocks, { _parent: blockId });
  for (const child of children) {
    blocks.push(...getBlockWithChildren(child._id, allBlocks));
  }
  return blocks;
}

const getBlockWithChildren = (blockId: string, allBlocks: ChaiBlock[]) => {
  let blocks = [];
  blocks = flattenDeep([...blocks, ...getChildBlocks(allBlocks, blockId, blocks)]);
  return blocks;
};

export const askAiProcessingAtom = atom(false);

export const useAskAi = () => {
  const [processing, setProcessing] = useAtom(askAiProcessingAtom);
  const [error, setError] = useState(null);
  const callBack = useBuilderProp("askAiCallBack", null);
  const updateBlockProps = useUpdateMultipleBlocksProps();
  const [blocks] = useBlocksStore();
  return {
    askAi: useCallback(
      async (blockId: string, prompt: string, onComplete?: () => void) => {
        if (!callBack) return;
        setProcessing(true);
        setError(null);
        try {
          const aiBlocks = cloneDeep(getBlockWithChildren(blockId, blocks));
          set(aiBlocks, "0._parent", null);
          const { blocks: updatedBlocks, error } = await callBack(prompt, aiBlocks);
          if (error) {
            setError(error);
            return;
          }
          updateBlockProps(updatedBlocks);
        } catch (e) {
          setError(e);
        } finally {
          setProcessing(false);
          if (onComplete) onComplete();
        }
      },
      [callBack],
    ),
    loading: processing,
    error,
  };
};

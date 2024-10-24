import { useCallback } from "react";
import { useBlocksStoreUndoableActions } from "../history/useBlocksStoreUndoableActions.ts";
import { ChaiBlock } from "../types/ChaiBlock.ts";
import { get, chunk, isString, keys, omit, forEach, isEmpty, set, unset, memoize } from "lodash-es";
import { useLanguages } from "./useLanguages.ts";
import { useSelectedBlock } from "./useSelectedBlockIds.ts";
import { getBlockComponent } from "@chaibuilder/runtime";

const updatePropsForLanguage = memoize((props: Record<string, any>, selectedLang: string, selectedBlock: ChaiBlock) => {
  const chaiBlock = getBlockComponent(get(selectedBlock, "_type"));
  if (!chaiBlock) return props;

  const updatedProps = { ...props };
  forEach(keys(props), (key) => {
    if (get(chaiBlock, ["props", key, "i18n"]) && !isEmpty(selectedLang)) {
      const _key = `${key}-${selectedLang}`;
      set(updatedProps, _key, props[key]);
      unset(updatedProps, key);
    }
  });
  return updatedProps;
});

/**
 *
 */
export const useUpdateBlocksProps = () => {
  const { updateBlocks } = useBlocksStoreUndoableActions();
  const { selectedLang } = useLanguages();
  const selectedBlock = useSelectedBlock();

  return useCallback(
    (blockIds: Array<string>, props: Record<string, any>, prevPropsState?: Record<string, any>) => {
      const updatedProps = updatePropsForLanguage(props, selectedLang, selectedBlock);
      updateBlocks(blockIds, updatedProps, prevPropsState);
    },
    [selectedLang, selectedBlock, updateBlocks],
  );
};

export const useUpdateMultipleBlocksProps = () => {
  const { updateMultipleBlocksProps } = useBlocksStoreUndoableActions();
  return useCallback(
    (blocks: Array<{ _id: string } & Partial<ChaiBlock>>) => {
      updateMultipleBlocksProps(blocks);
    },
    [updateMultipleBlocksProps],
  );
};

/**
 *
 */
const useFakeStreamEffect = () => {
  const { updateBlocksRuntime } = useBlocksStoreUndoableActions();
  return useCallback(
    async (id: string, block: Partial<ChaiBlock>, delay = 30) => {
      const props = keys(omit(block, ["_id"]));
      for (const prop of props) {
        const value = block[prop];
        if (isString(value)) {
          const letters = chunk(value.split(""), 12);
          let str = "";
          updateBlocksRuntime([id], { [prop]: "" });
          for (let i = 0; i < letters.length; i++) {
            str += letters[i].join("");
            updateBlocksRuntime([id], { [prop]: str });
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }
    },
    [updateBlocksRuntime],
  );
};

export const useStreamMultipleBlocksProps = () => {
  const { updateMultipleBlocksProps } = useBlocksStoreUndoableActions();
  const streamEffect = useFakeStreamEffect();
  return useCallback(
    async (blocks: Array<{ _id: string } & Partial<ChaiBlock>>) => {
      for (const block of blocks) {
        await streamEffect(block._id, block);
      }
      updateMultipleBlocksProps(blocks);
    },
    [streamEffect, updateMultipleBlocksProps],
  );
};

export const useUpdateBlocksPropsRealtime = () => {
  const { updateBlocksRuntime } = useBlocksStoreUndoableActions();
  const { selectedLang } = useLanguages();
  const selectedBlock = useSelectedBlock();

  return useCallback(
    (blockIds: Array<string>, props: Record<string, any>) => {
      const updatedProps = updatePropsForLanguage(props, selectedLang, selectedBlock);
      updateBlocksRuntime(blockIds, updatedProps);
    },
    [selectedLang, selectedBlock, updateBlocksRuntime],
  );
};

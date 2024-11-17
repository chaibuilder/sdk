import { cloneDeep, filter, find, flattenDeep } from "lodash-es";
import { useBuilderProp } from "./useBuilderProp.ts";
import { useCallback, useState } from "react";
import { useBlocksStore } from "../history/useBlocksStoreUndoableActions.ts";
import { ChaiBlock } from "../types/ChaiBlock.ts";
import { useStreamMultipleBlocksProps, useUpdateMultipleBlocksProps } from "./useUpdateBlocksProps.ts";
import { atom, useAtom } from "jotai";
import { AskAiResponse } from "../types/chaiBuilderEditorProps.ts";
import { useLanguages } from "./useLanguages.ts";
import { compact, startsWith } from "lodash-es";
import { STYLES_KEY } from "../constants/STRINGS.ts";
import { pick, get, has } from "lodash-es";
import { getRegisteredChaiBlock } from "@chaibuilder/runtime";
import { isEmpty } from "lodash-es";
import { LANGUAGES } from "../constants/LANGUAGES.ts";
import { useRightPanel } from "./useTheme.ts";

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

const pickOnlyAIProps = (blocks: ChaiBlock[], lang: string) => {
  return compact(
    blocks.map((block) => {
      const keys = ["_id", "_type", "_parent"];
      const newBlock = pick(block, keys);
      const registeredBlock = getRegisteredChaiBlock(block._type);
      const aiProps = {};
      for (const key in block) {
        if (keys.includes(key)) continue;
        if (get(registeredBlock, `props.${key}.ai`, false)) {
          aiProps[key] = get(block, `${key}-${lang}`, block[key]);
        }
      }
      if (isEmpty(aiProps)) return false;
      if (has(newBlock, "_parent") && isEmpty(newBlock._parent)) delete newBlock._parent;
      return { ...newBlock, ...aiProps };
    }),
  );
};

const addLangToPrompt = (prompt: string, currentLang: string, type: string) => {
  if (!currentLang || type !== "content") return prompt;
  return `${prompt}. Generate content in ${get(LANGUAGES, currentLang, currentLang)} language.`;
};

export const askAiProcessingAtom = atom(false);

// update prompt for content type for lang support
export const useAskAi = () => {
  const [processing, setProcessing] = useAtom(askAiProcessingAtom);
  const [error, setError] = useState(null);
  const callBack = useBuilderProp("askAiCallBack", null);
  const updateBlocksWithStream = useStreamMultipleBlocksProps();
  const updateBlockPropsAll = useUpdateMultipleBlocksProps();
  const [blocks] = useBlocksStore();
  const { selectedLang, fallbackLang } = useLanguages();
  const currentLang = selectedLang.length ? selectedLang : fallbackLang;

  const getBlockForStyles = (blockId: string, blocks: ChaiBlock[]) => {
    const block = cloneDeep(blocks.find((block) => block._id === blockId));
    for (const key in block) {
      const value = block[key];
      if (typeof value === "string" && startsWith(value, STYLES_KEY)) {
        block[key] = compact(flattenDeep(value.replace(STYLES_KEY, "").split(","))).join(" ");
      } else {
        if (key !== "_id") delete block[key];
      }
    }
    return block;
  };

  return {
    askAi: useCallback(
      async (
        type: "styles" | "content",
        blockId: string,
        prompt: string,
        onComplete?: (response?: AskAiResponse) => void,
      ) => {
        if (!callBack) return;
        setProcessing(true);
        setError(null);
        try {
          const lang = selectedLang === fallbackLang ? "" : selectedLang;
          const aiBlocks =
            type === "content"
              ? pickOnlyAIProps(cloneDeep(getBlockWithChildren(blockId, blocks)), selectedLang)
              : [getBlockForStyles(blockId, blocks)];

          const askAiResponse = await callBack(type, addLangToPrompt(prompt, currentLang, type), aiBlocks, lang);

          const { blocks: updatedBlocks, error } = askAiResponse;
          if (error) {
            setError(error);
            return;
          }
          if (type === "styles") {
            const blocks = updatedBlocks.map((block) => {
              for (const key in block) {
                if (key !== "_id") {
                  block[key] = `${STYLES_KEY},${block[key]}`;
                }
              }
              return block;
            });
            updateBlockPropsAll(blocks);
          } else {
            updateBlocksWithStream(updatedBlocks);
          }
          if (onComplete) onComplete(askAiResponse);
        } catch (e) {
          setError(e);
        } finally {
          setProcessing(false);
          if (onComplete) onComplete();
        }
      },
      [
        callBack,
        setProcessing,
        selectedLang,
        fallbackLang,
        blocks,
        currentLang,
        updateBlockPropsAll,
        updateBlocksWithStream,
      ],
    ),
    loading: processing,
    error,
  };
};
export const useAiAssistant = () => {
  const [, setRightPanel] = useRightPanel();
  return useCallback(
    (value: boolean) => {
      setRightPanel(value ? "ai" : "block");
    },
    [setRightPanel],
  );
};

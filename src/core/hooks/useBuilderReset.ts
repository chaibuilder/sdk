import { useSetAtom } from "jotai";
import { useAtom } from "jotai/index";
import { aiAssistantActiveAtom, historyStatesAtom } from "../atoms/ui";
import { useUndoManager } from "../history/useUndoManager.ts";
import { useBlockHighlight } from "./useBlockHighlight";
import { usePartailBlocksStore } from "./usePartialBlocksStore.ts";
import { useSelectedBlockIds } from "./useSelectedBlockIds";
import { useSelectedStylingBlocks } from "./useSelectedStylingBlocks";

export const useBuilderReset = () => {
  const setNewState = useSetAtom(historyStatesAtom);
  const { clear } = useUndoManager();
  const [, setSelectedIds] = useSelectedBlockIds();
  const { clearHighlight } = useBlockHighlight();
  const [, setStylingHighlighted] = useSelectedStylingBlocks();
  const [, setAiAssistantActive] = useAtom(aiAssistantActiveAtom);
  const { reset: resetPartialBlocks } = usePartailBlocksStore();

  return () => {
    setSelectedIds([]);
    setStylingHighlighted([]);
    clearHighlight();
    clear();
    setAiAssistantActive(false);
    setNewState({ undoCount: 0, redoCount: 0 });
    resetPartialBlocks();
  };
};

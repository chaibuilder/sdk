import { useAtom, useSetAtom } from "jotai";
import { useCallback } from "react";
import { aiAssistantActiveAtom, historyStatesAtom } from "../atoms/ui";
import { useUndoManager } from "../history/useUndoManager";
import { useBlockHighlight } from "./useBlockHighlight";
import { useGlobalBlocksStore } from "./useGlobalBlocksStore";

export const useBuilderReset = () => {
  const setNewState = useSetAtom(historyStatesAtom);
  const { clear } = useUndoManager();
  //FIXME: Check for rerendering
  // const [, setSelectedIds] = useSelectedBlockIds();
  // const [, setStylingHighlighted] = useSelectedStylingBlocks();

  const { clearHighlight } = useBlockHighlight();
  const [, setAiAssistantActive] = useAtom(aiAssistantActiveAtom);
  const { reset: resetGlobalBlocks } = useGlobalBlocksStore();

  return useCallback(() => {
    // setSelectedIds([]);
    // setStylingHighlighted([]);
    clearHighlight();
    clear();
    setAiAssistantActive(false);
    setNewState({ undoCount: 0, redoCount: 0 });
    resetGlobalBlocks();
  }, [clear, clearHighlight, setAiAssistantActive, setNewState, resetGlobalBlocks]);
};

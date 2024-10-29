import { useBlockHighlight } from "./useBlockHighlight";
import { useSelectedBlockIds } from "./useSelectedBlockIds";
import { useSelectedStylingBlocks } from "./useSelectedStylingBlocks";
import { useSetAtom } from "jotai";
import { aiAssistantActiveAtom, historyStatesAtom } from "../atoms/ui";
import { useUndoManager } from "../history/useUndoManager.ts";
import { useAtom } from "jotai/index";
import { useGlobalBlocksStore } from "./useGlobalBlocksStore.ts";

export const useBuilderReset = () => {
  const setNewState = useSetAtom(historyStatesAtom);
  const { clear } = useUndoManager();
  const [, setSelectedIds] = useSelectedBlockIds();
  const { clearHighlight } = useBlockHighlight();
  const [, setStylingHighlighted] = useSelectedStylingBlocks();
  const [, setAiAssistantActive] = useAtom(aiAssistantActiveAtom);
  const { reset: resetGlobalBlocks } = useGlobalBlocksStore();

  return () => {
    setSelectedIds([]);
    setStylingHighlighted([]);
    clearHighlight();
    clear();
    setAiAssistantActive(false);
    setNewState({ undoCount: 0, redoCount: 0 });
    resetGlobalBlocks();
  };
};

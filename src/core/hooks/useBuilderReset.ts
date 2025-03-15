import { useAtom } from "jotai/index";
import { aiAssistantActiveAtom } from "../atoms/ui";
import { useUndoManager } from "../history/useUndoManager.ts";
import { useBlockHighlight } from "./useBlockHighlight";
import { usePartailBlocksStore } from "./usePartialBlocksStore.ts";
import { useSavePage } from "./useSavePage.ts";
import { useSelectedBlockIds } from "./useSelectedBlockIds";
import { useSelectedStylingBlocks } from "./useSelectedStylingBlocks";

export const useBuilderReset = () => {
  const { clear } = useUndoManager();
  const [, setSelectedIds] = useSelectedBlockIds();
  const { clearHighlight } = useBlockHighlight();
  const [, setStylingHighlighted] = useSelectedStylingBlocks();
  const [, setAiAssistantActive] = useAtom(aiAssistantActiveAtom);
  const { reset: resetPartialBlocks } = usePartailBlocksStore();
  const { setSaveState } = useSavePage();

  return () => {
    setSelectedIds([]);
    setStylingHighlighted([]);
    clearHighlight();
    clear();
    setAiAssistantActive(false);
    resetPartialBlocks();
    setSaveState("SAVED");
  };
};

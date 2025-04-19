import { aiAssistantActiveAtom } from "@/core/atoms/ui";
import { useUndoManager } from "@/core/history/useUndoManager";
import { useBlockHighlight } from "@/core/hooks/useBlockHighlight";
import { usePartailBlocksStore } from "@/core/hooks/usePartialBlocksStore";
import { useSavePage } from "@/core/hooks/useSavePage";
import { useSelectedBlockIds } from "@/core/hooks/useSelectedBlockIds";
import { useSelectedStylingBlocks } from "@/core/hooks/useSelectedStylingBlocks";
import { useAtom } from "jotai";

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

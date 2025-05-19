import { useBlockRepeaterDataAtom } from "@/core/async-props/use-async-props";
import { aiAssistantActiveAtom } from "@/core/atoms/ui";
import { useUndoManager } from "@/core/history/use-undo-manager";
import { useBlockHighlight } from "@/core/hooks/use-block-highlight";
import { usePartialBlocksStore } from "@/core/hooks/use-partial-blocks-store";
import { useSavePage } from "@/core/hooks/use-save-page";
import { useSelectedBlockIds } from "@/core/hooks/use-selected-blockIds";
import { useSelectedStylingBlocks } from "@/core/hooks/use-selected-styling-blocks";
import { useAtom } from "jotai";

export const useBuilderReset = () => {
  const { clear } = useUndoManager();
  const [, setSelectedIds] = useSelectedBlockIds();
  const { clearHighlight } = useBlockHighlight();
  const [, setStylingHighlighted] = useSelectedStylingBlocks();
  const [, setAiAssistantActive] = useAtom(aiAssistantActiveAtom);
  const { reset: resetPartialBlocks } = usePartialBlocksStore();
  const { setSaveState } = useSavePage();
  const [, setBlockRepeaterDataAtom] = useBlockRepeaterDataAtom();

  return () => {
    setBlockRepeaterDataAtom({});
    setSelectedIds([]);
    setStylingHighlighted([]);
    clearHighlight();
    clear();
    setAiAssistantActive(false);
    resetPartialBlocks();
    setSaveState("SAVED");
  };
};

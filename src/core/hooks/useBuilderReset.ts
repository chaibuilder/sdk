import { useHighlightBlockId } from "./useHighlightBlockId";
import { useSelectedBlockIds } from "./useSelectedBlockIds";
import { useSelectedStylingBlocks } from "./useSelectedStylingBlocks";
import { useSetAtom } from "jotai";
import { historyStatesAtom } from "../atoms/ui";
import { useUndoManager } from "../history/useUndoManager.ts";

export const useBuilderReset = () => {
  const setNewState = useSetAtom(historyStatesAtom);
  const { clear } = useUndoManager();
  const [, setSelectedIds] = useSelectedBlockIds();
  const [, setHighlighted] = useHighlightBlockId();
  const [, setStylingHighlighted] = useSelectedStylingBlocks();
  return () => {
    setSelectedIds([]);
    setStylingHighlighted([]);
    setHighlighted("");
    clear();
    setNewState({ undoCount: 0, redoCount: 0 });
  };
};

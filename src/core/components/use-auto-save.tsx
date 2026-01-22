import { userActionsCountAtom } from "@/atoms/builder";
import { useBuilderProp } from "@/hooks/use-builder-prop";
import { useSavePage } from "@/hooks/use-save-page";
import { useAtom } from "jotai";
import { useCallback, useEffect } from "react";

export const useAutoSave = () => {
  const { savePage, saveState } = useSavePage();
  const autoSave = useBuilderProp("autoSave", true);
  const autoSaveActionsCount = useBuilderProp("autoSaveActionsCount", 10);
  const [actionsCount] = useAtom(userActionsCountAtom);
  useEffect(() => {
    if (!autoSave) return;
    if (saveState === "SAVED" || saveState === "SAVING") return;
    if (actionsCount >= autoSaveActionsCount) {
      savePage(true);
    }
  }, [autoSave, saveState, actionsCount, autoSaveActionsCount]);
};

export const useIncrementActionsCount = () => {
  const [, setActionsCount] = useAtom(userActionsCountAtom);
  return useCallback(() => {
    setActionsCount((prev) => prev + 1);
  }, [setActionsCount]);
};

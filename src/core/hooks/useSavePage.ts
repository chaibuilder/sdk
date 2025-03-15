import { useThrottledCallback } from "@react-hookz/web";
import { atom, useAtom } from "jotai";
import { noop } from "lodash-es";
import { useBuilderProp } from "./useBuilderProp";
import { useGetPageData } from "./useGetPageData";
import { useTheme } from "./useTheme.ts";

export const builderSaveStateAtom = atom<"SAVED" | "SAVING" | "UNSAVED">("SAVED"); // SAVING
builderSaveStateAtom.debugLabel = "builderSaveStateAtom";

export const useSavePage = () => {
  const [saveState, setSaveState] = useAtom(builderSaveStateAtom);
  const onSave = useBuilderProp("onSave", async (_args) => {});
  const onSaveStateChange = useBuilderProp("onSaveStateChange", noop);
  const getPageData = useGetPageData();
  const [theme] = useTheme();

  const savePage = useThrottledCallback(
    async (autoSave: boolean = false) => {
      setSaveState("SAVING");
      onSaveStateChange("SAVING");
      const pageData = getPageData();
      await onSave({
        autoSave,
        blocks: pageData.blocks,
        theme,
      });
      setTimeout(() => {
        setSaveState("SAVED");
        onSaveStateChange("SAVED");
      }, 100);
      return true;
    },
    [getPageData, setSaveState, theme, onSave, onSaveStateChange],
    3000, // save only every 5 seconds
  );

  return { savePage, saveState, setSaveState };
};

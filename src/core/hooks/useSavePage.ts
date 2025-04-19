import { useBuilderProp } from "@/core/hooks/useBuilderProp";
import { useGetPageData } from "@/core/hooks/useGetPageData";
import { usePermissions } from "@/core/hooks/usePermissions";
import { useTheme } from "@/core/hooks/useTheme";
import { useThrottledCallback } from "@react-hookz/web";
import { atom, useAtom } from "jotai";
import { noop } from "lodash-es";
export const builderSaveStateAtom = atom<"SAVED" | "SAVING" | "UNSAVED">("SAVED"); // SAVING
builderSaveStateAtom.debugLabel = "builderSaveStateAtom";

export const useSavePage = () => {
  const [saveState, setSaveState] = useAtom(builderSaveStateAtom);
  const onSave = useBuilderProp("onSave", async (_args) => {});
  const onSaveStateChange = useBuilderProp("onSaveStateChange", noop);
  const getPageData = useGetPageData();
  const [theme] = useTheme();
  const { hasPermission } = usePermissions();

  const savePage = useThrottledCallback(
    async (autoSave: boolean = false) => {
      if (!hasPermission("save_page")) {
        return;
      }
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

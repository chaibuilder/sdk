import { useBuilderProp } from "@/core/hooks/use-builder-prop";
import { useGetPageData } from "@/core/hooks/use-get-page-data";
import { usePermissions } from "@/core/hooks/use-permissions";
import { useTheme } from "@/core/hooks/use-theme";
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

  const savePageAsync = async () => {
    if (!hasPermission("save_page")) {
      return;
    }
    setSaveState("SAVING");
    onSaveStateChange("SAVING");
    const pageData = getPageData();
    await onSave({
      autoSave: true,
      blocks: pageData.blocks,
      theme,
    });
    setTimeout(() => {
      setSaveState("SAVED");
      onSaveStateChange("SAVED");
    }, 100);
    return true;
  };

  return { savePage, savePageAsync, saveState, setSaveState };
};

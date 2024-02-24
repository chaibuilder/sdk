import { useThrottledCallback } from "@react-hookz/web";
import { atom, useAtom, useSetAtom } from "jotai";
import { useGetPageData } from "./useGetPageData";
import { useBuilderProp } from "./useBuilderProp";
import { historyStatesAtom } from "../atoms/ui";
import { useCanvasHistory } from "./useCanvasHistory";
import { usePageDataProviders } from "./usePageDataProviders.ts";

export const pageSyncStateAtom = atom<"SAVED" | "UNSAVED" | "SAVING">("SAVED"); // SAVING
pageSyncStateAtom.debugLabel = "pageSyncStateAtom";

export const useSavePage = () => {
  const [syncState, setSyncState] = useAtom(pageSyncStateAtom);
  const onSaveBlocks = useBuilderProp("onSaveBlocks", async () => {});
  const onSavePage = useBuilderProp("onSavePage", async () => {});
  const onSyncStatusChange = useBuilderProp("onSyncStatusChange", () => {});
  const getPageData = useGetPageData();
  const setNewState = useSetAtom(historyStatesAtom);
  const { undoCount, redoCount } = useCanvasHistory();
  const [providers] = usePageDataProviders();
  const savePage = useThrottledCallback(
    async () => {
      setSyncState("SAVING");
      onSyncStatusChange("SAVING");
      const pageData = getPageData();
      await onSavePage({ blocks: pageData.blocks, providers });
      setTimeout(() => {
        setNewState({ undoCount, redoCount });
        setSyncState("SAVED");
        onSyncStatusChange("SAVED");
      }, 100);
      return true;
    },
    [getPageData, setSyncState, onSyncStatusChange, onSaveBlocks],
    5000, // save only every 5 seconds
  );

  return { savePage, syncState, setSyncState };
};

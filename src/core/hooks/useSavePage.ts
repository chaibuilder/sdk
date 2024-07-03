import { useThrottledCallback } from "@react-hookz/web";
import { atom, useAtom } from "jotai";
import { useGetPageData } from "./useGetPageData";
import { useBuilderProp } from "./useBuilderProp";
import { usePageDataProviders } from "./usePageDataProviders.ts";
import { useBrandingOptions } from "./useBrandingOptions.ts";
import { noop } from "lodash-es";

export const pageSyncStateAtom = atom<"SAVED" | "UNSAVED" | "SAVING">("SAVED"); // SAVING
pageSyncStateAtom.debugLabel = "pageSyncStateAtom";

export const useSavePage = () => {
  const [syncState, setSyncState] = useAtom(pageSyncStateAtom);
  const onSavePage = useBuilderProp("onSavePage", async (_args) => {});
  const onSave = useBuilderProp("onSave", async (_args) => {});
  const onSaveStatusChange = useBuilderProp("onSaveStatusChange", noop);
  const getPageData = useGetPageData();
  const [providers] = usePageDataProviders();
  const [brandingOptions] = useBrandingOptions();

  const savePage = useThrottledCallback(
    async () => {
      setSyncState("SAVING");
      onSaveStatusChange("SAVING");
      const pageData = getPageData();
      await onSavePage({ blocks: pageData.blocks, providers });
      await onSave({ blocks: pageData.blocks, providers, brandingOptions });
      setTimeout(() => {
        setSyncState("SAVED");
        onSaveStatusChange("SAVED");
      }, 100);
      return true;
    },
    [getPageData, setSyncState, brandingOptions, onSave, onSaveStatusChange],
    5000, // save only every 5 seconds
  );

  return { savePage, syncState, setSyncState };
};

import { userActionsCountAtom } from "@/atoms/builder";
import { useBuilderProp } from "@/hooks/use-builder-prop";
import { useCheckStructure } from "@/hooks/use-check-structure";
import { useGetPageData } from "@/hooks/use-get-page-data";
import { useIsPageLoaded } from "@/hooks/use-is-page-loaded";
import { useLanguages } from "@/hooks/use-languages";
import { usePermissions } from "@/hooks/use-permissions";
import { getRegisteredChaiBlock } from "@/runtime";
import { useThrottledCallback } from "@react-hookz/web";
import { atom, useAtom } from "jotai";
import { has, isEmpty, noop } from "lodash-es";
import { useCallback } from "react";

export const builderSaveStateAtom = atom<"SAVED" | "SAVING" | "UNSAVED">("SAVED"); // SAVING
builderSaveStateAtom.debugLabel = "builderSaveStateAtom";

export const checkMissingTranslations = (blocks: any[], lang: string): boolean => {
  if (!lang) return false;

  return blocks.some((block) => {
    if (!block?._type || block._type === "PartialBlock") {
      return false;
    }

    try {
      const blockDef = getRegisteredChaiBlock(block._type);
      if (!blockDef) return false;

      const i18nProps = has(blockDef, "i18nProps") ? (blockDef.i18nProps ?? []) : [];

      return i18nProps.some((prop: string) => {
        const translatedProp = `${prop}-${lang}`;
        return !block[translatedProp] || isEmpty(block[translatedProp]);
      });
    } catch (error) {
      console.warn(`Failed to get block definition for type: ${block._type}`, error);
      return false;
    }
  });
};

export const useSavePage = () => {
  const [saveState, setSaveState] = useAtom(builderSaveStateAtom);
  const onSave = useBuilderProp("onSave", async (_error: any) => {});
  const onSaveStateChange = useBuilderProp("onSaveStateChange", noop);
  const getPageData = useGetPageData();
  const { hasPermission } = usePermissions();
  const { selectedLang, fallbackLang } = useLanguages();
  const [isPageLoaded] = useIsPageLoaded();
  const checkStructure = useCheckStructure();
  const [, setActionsCount] = useAtom(userActionsCountAtom);

  const needTranslations = () => {
    const pageData = getPageData();
    return !selectedLang || selectedLang === fallbackLang
      ? false
      : checkMissingTranslations(pageData.blocks || [], selectedLang);
  };

  const shouldSkipSave = useCallback(
    (force: boolean) => {
      // Skip save if no permission or page not loaded
      if (!force && (!hasPermission("save_page") || !isPageLoaded)) {
        return true;
      }
      // Skip save if there are no unsaved changes
      if (!force && saveState === "SAVED") {
        return true;
      }
      return false;
    },
    [hasPermission, isPageLoaded, saveState],
  );

  const savePage = useThrottledCallback(
    async (autoSave: boolean = false, force: boolean = false) => {
      if (shouldSkipSave(force)) {
        return;
      }
      // Run structure validation before saving
      const pageData = getPageData();
      if (pageData?.blocks) {
        // @ts-ignore
        checkStructure(pageData.blocks);
      }
      setSaveState("SAVING");
      onSaveStateChange("SAVING");
      setActionsCount(0);
      await onSave({
        autoSave,
        blocks: pageData.blocks,
        needTranslations: needTranslations(),
      });
      setTimeout(() => {
        setSaveState("SAVED");
        onSaveStateChange("SAVED");
      }, 100);
      return true;
    },
    [
      shouldSkipSave,
      getPageData,
      setSaveState,
      setActionsCount,
      onSave,
      onSaveStateChange,
      isPageLoaded,
      checkStructure,
    ],
    3000, // save only every 5 seconds
  );

  const savePageAsync = async (force: boolean = false) => {
    if (shouldSkipSave(force)) {
      return;
    }
    setSaveState("SAVING");
    onSaveStateChange("SAVING");
    const pageData = getPageData();
    setActionsCount(0);
    await onSave({
      autoSave: true,
      blocks: pageData.blocks,
      needTranslations: needTranslations(),
    });
    setTimeout(() => {
      setSaveState("SAVED");
      onSaveStateChange("SAVED");
    }, 100);
    return true;
  };

  return { savePage, savePageAsync, saveState, setSaveState, needTranslations };
};

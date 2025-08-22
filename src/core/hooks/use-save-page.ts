import { useBuilderProp } from "@/core/hooks/use-builder-prop";
import { useGetPageData } from "@/core/hooks/use-get-page-data";
import { usePermissions } from "@/core/hooks/use-permissions";
import { useTheme } from "@/core/hooks/use-theme";
import { useThrottledCallback } from "@react-hookz/web";
import { getRegisteredChaiBlock } from "@chaibuilder/runtime";
import { atom, useAtom } from "jotai";
import { has, isEmpty, noop } from "lodash-es";
import { useLanguages } from "@/core/hooks/use-languages";
import { useIsPageLoaded } from "@/core/hooks/use-is-page-loaded";
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

      const i18nProps = has(blockDef, "i18nProps") ? blockDef.i18nProps : [];

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
  const onSave = useBuilderProp("onSave", async (_args) => {});
  const onSaveStateChange = useBuilderProp("onSaveStateChange", noop);
  const getPageData = useGetPageData();
  const [theme] = useTheme();
  const { hasPermission } = usePermissions();
  const { selectedLang, fallbackLang } = useLanguages();
  const isPageLoaded = useIsPageLoaded();

  const needTranslations = () => {
    const pageData = getPageData();
    return !selectedLang || selectedLang === fallbackLang
      ? false
      : checkMissingTranslations(pageData.blocks || [], selectedLang);
  };

  const savePage = useThrottledCallback(
    async (autoSave: boolean = false) => {
      if (!hasPermission("save_page") || !isPageLoaded) {
        return;
      }
      setSaveState("SAVING");
      onSaveStateChange("SAVING");
      const pageData = getPageData();

      await onSave({
        autoSave,
        blocks: pageData.blocks,
        theme,
        needTranslations: needTranslations(),
      });
      setTimeout(() => {
        setSaveState("SAVED");
        onSaveStateChange("SAVED");
      }, 100);
      return true;
    },
    [getPageData, setSaveState, theme, onSave, onSaveStateChange, isPageLoaded],
    3000, // save only every 5 seconds
  );

  const savePageAsync = async () => {
    if (!hasPermission("save_page") || !isPageLoaded) {
      return;
    }
    setSaveState("SAVING");
    onSaveStateChange("SAVING");
    const pageData = getPageData();

    await onSave({
      autoSave: true,
      blocks: pageData.blocks,
      theme,
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

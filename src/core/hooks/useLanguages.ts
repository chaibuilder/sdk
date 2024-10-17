import { useBuilderProp } from "./useBuilderProp";
import { atom, useAtom } from "jotai";
import { useSelectedBlockIds } from "./useSelectedBlockIds";
import { useHighlightBlockId } from "./useHighlightBlockId";
import { useSelectedStylingBlocks } from "./useSelectedStylingBlocks";

const languageAtom = atom("");
languageAtom.debugLabel = "selectedLanguageAtom";

export const useLanguages = () => {
  const languages = useBuilderProp("languages", []);
  const fallbackLang = useBuilderProp("fallbackLang", "en");
  const [selectedLang, _setSelectedLang] = useAtom(languageAtom);
  const [, setSelected] = useSelectedBlockIds();
  const [, setHighlighted] = useHighlightBlockId();
  const [, setSelectedStylingBlocks] = useSelectedStylingBlocks();

  const setSelectedLang = (lang: string) => {
    if (selectedLang === (fallbackLang === lang ? "" : lang)) return;

    setSelected([]);
    setHighlighted(null);
    setSelectedStylingBlocks([]);
    _setSelectedLang(fallbackLang === lang ? "" : lang);
  };

  return {
    languages,
    fallbackLang,
    selectedLang,
    setSelectedLang,
  };
};

import { atom, useAtom } from "jotai";
import { useCallback } from "react";
import { useBuilderProp } from "./useBuilderProp";
const languageAtom = atom("");
languageAtom.debugLabel = "selectedLanguageAtom";

export const useLanguages = () => {
  const languages = useBuilderProp("languages", []);
  const fallbackLang = useBuilderProp("fallbackLang", "en");
  const [selectedLang, _setSelectedLang] = useAtom(languageAtom);

  const setSelectedLang = useCallback(
    (lang: string) => {
      _setSelectedLang(fallbackLang === lang ? "" : lang);
    },
    [fallbackLang, _setSelectedLang],
  );

  return {
    languages: languages?.filter((_lang) => _lang !== fallbackLang),
    fallbackLang,
    selectedLang,
    setSelectedLang,
  };
};

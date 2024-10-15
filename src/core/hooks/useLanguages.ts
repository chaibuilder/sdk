import { useBuilderProp } from "./useBuilderProp";
import { atom, useAtom } from "jotai";

const languageAtom = atom("");
languageAtom.debugLabel = "selectedLanguageAtom";

export const useLanguages = () => {
  const languages = useBuilderProp("languages", []);
  const fallbackLang = useBuilderProp("fallbackLang", "en");
  const [selectedLang, _setSelectedLang] = useAtom(languageAtom);
  const setSelectedLang = (lang: string) => _setSelectedLang(fallbackLang === lang ? "" : lang);

  return {
    languages,
    fallbackLang,
    selectedLang,
    setSelectedLang,
  };
};

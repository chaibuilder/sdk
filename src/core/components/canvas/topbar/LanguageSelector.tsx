import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../../ui";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { useLanguages } from "../../../hooks";
import { isEmpty, map, uniq, forEach, get } from "lodash-es";
import { useMemo } from "react";
import { LANGUAGES } from "../../../constants/LANGUAGES";
import { FaLanguage, FaStar } from "react-icons/fa6";
import { mergeClasses } from "../../../main";

export const LanguageSelector: React.FC = () => {
  const { fallbackLang, languages, selectedLang, setSelectedLang } = useLanguages();
  const currentLang = selectedLang?.length > 0 ? selectedLang : fallbackLang;

  const langOptions = useMemo(() => {
    const options = [];
    forEach(uniq([fallbackLang, ...languages]), (key) => {
      const value = get(LANGUAGES, key);
      if (value) options.push({ key, value, default: key === fallbackLang });
    });
    return options;
  }, [fallbackLang, languages]);

  if (isEmpty(languages) && currentLang === "en") {
    return null;
  }

  if (isEmpty(languages) && currentLang !== "en") {
    return (
      <div className="flex items-center gap-x-1 text-sm text-blue-500 hover:text-blue-600">
        <FaLanguage className="h-4 w-4" />
        {get(LANGUAGES, currentLang)}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost" className="flex items-center gap-x-1 text-blue-500 hover:text-blue-600">
          <FaLanguage className="h-4 w-4" />
          <div className="flex items-center space-x-2">
            <div> {get(LANGUAGES, currentLang)}</div>
            <ChevronDownIcon className="h-4 w-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="border-border">
        {map(langOptions, (option) => (
          <DropdownMenuItem
            className={mergeClasses(
              "flex cursor-pointer items-center text-sm",
              option.key === currentLang && "!bg-blue-500 text-white hover:!text-white",
            )}
            onClick={() => setSelectedLang(option.key)}>
            <div>{option.value}</div>
            {option.key === fallbackLang ? <FaStar className="ml-2 h-4 w-4 text-yellow-400" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

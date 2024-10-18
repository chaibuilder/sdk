import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../../ui";
import { GlobeIcon } from "@radix-ui/react-icons";
import { useLanguages } from "../../../hooks";
import { isEmpty, map, uniq, forEach, get } from "lodash-es";
import { useMemo } from "react";
import { LANGUAGES } from "../../../constants/LANGUAGES";

export const LanguageSelector: React.FC = () => {
  const { fallbackLang, languages, selectedLang, setSelectedLang } = useLanguages();
  const currentLang = selectedLang?.length > 0 ? selectedLang : fallbackLang;

  const langOptions = useMemo(() => {
    const options = [];
    forEach(uniq([...languages, fallbackLang]), (key) => {
      const value = get(LANGUAGES, key);
      if (value) options.push({ key, value, default: key === fallbackLang });
    });
    return options;
  }, [fallbackLang, languages]);

  if (isEmpty(languages)) {
    return (
      <div className="flex items-center gap-x-1 text-sm">
        <GlobeIcon className="h-4 w-4" />
        {get(LANGUAGES, currentLang)}
        {currentLang === fallbackLang && (
          <span className="h-full pl-1 text-[10px] leading-4 text-green-400">Default</span>
        )}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" className="flex items-center gap-x-1 text-blue-500 hover:text-blue-600">
          <GlobeIcon className="h-4 w-4" />
          <div className="flex items-end">
            <div> {get(LANGUAGES, currentLang)}</div>
            {currentLang === fallbackLang && (
              <span className="h-full pl-1 text-[10px] leading-4 text-gray-400">Default</span>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {map(langOptions, (option) => (
          <DropdownMenuItem className="flex cursor-pointer items-end" onClick={() => setSelectedLang(option.key)}>
            <div>{option.value}</div>
            {option.key === fallbackLang && (
              <span className="h-full pl-1 text-[10px] leading-4 text-green-400">Default</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

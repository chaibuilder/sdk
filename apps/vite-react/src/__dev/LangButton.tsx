import { mergeClasses, useLanguages } from "@chaibuilder/sdk";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@chaibuilder/sdk/ui";
import { get, isEmpty, map } from "lodash-es";
import { ChevronDown, Languages, Star } from "lucide-react";

export const LanguageButton = () => {
  const { fallbackLang, selectedLang, setSelectedLang } = useLanguages();
  const currentLang = !isEmpty(selectedLang) ? selectedLang : fallbackLang;

  const languageOptions = [
    { key: "fr", value: "French" },
    { key: "en", value: "English" },
  ];
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="focus:outline-none">
          <Button variant="ghost" size="sm" className="gap-2">
            <Languages className="w-4 h-4" />
            {get({}, currentLang, currentLang)}
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="space-y-1 border-border">
          {map(languageOptions, (option: any) => (
            <DropdownMenuItem
              key={option.value}
              className={mergeClasses(
                "flex cursor-pointer items-center justify-between text-xs font-medium text-gray-800",
                option.key === currentLang && "!bg-gray-200 text-gray-700",
              )}
              onClick={() => setSelectedLang(option.key)}>
              <div className="text-slate-600">{option.value}</div>
              {option.key === fallbackLang && (
                <small className={`flex items-center gap-x-1 text-[9px] leading-none text-orange-500`}>
                  <Star fill="orange" className="w-2 h-2" />
                  Primary
                </small>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../../ui";
import { GlobeIcon } from "@radix-ui/react-icons";
import { useLanguages } from "../../../hooks";
import { isEmpty, includes, map } from "lodash";

export const LanguageSelector: React.FC = () => {
  const { fallbackLang, languages, selectedLang, setSelectedLang } = useLanguages();
  const currentLang = selectedLang?.length > 0 ? selectedLang : fallbackLang;

  if (isEmpty(languages)) {
    return (
      <div className="flex items-center gap-x-1 text-sm">
        <GlobeIcon className="h-4 w-4" />
        {currentLang}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost" className="flex items-center gap-x-1 text-blue-500 hover:text-blue-600">
          <GlobeIcon className="h-4 w-4" />
          {currentLang}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {!includes(languages, fallbackLang) && (
          <DropdownMenuItem className="cursor-pointer" onClick={() => setSelectedLang(fallbackLang)}>
            {fallbackLang}
          </DropdownMenuItem>
        )}
        {map(languages, (lang) => (
          <DropdownMenuItem className="cursor-pointer" onClick={() => setSelectedLang(lang)}>
            {lang}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

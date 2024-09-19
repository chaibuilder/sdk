import * as React from "react";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../../ui";
import { cn } from "../../../../functions/Functions.ts";
import { useTranslation } from "react-i18next";
import { UILibrary } from "../../../../types/chaiBuilderEditorProps.ts";

export function UILibrariesSelect({
  uiLibraries,
  library,
  setLibrary,
}: {
  library?: string;
  uiLibraries: UILibrary[];
  setLibrary: (library: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const { t } = useTranslation();

  if (!library) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="flex flex-col gap-y-1">
          <span className="text-xs font-bold text-gray-500">{t("choose_library")}</span>
          <Button
            variant="outline"
            size="sm"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between">
            {library ? t(uiLibraries.find((uiLibrary) => uiLibrary.uuid === library)?.name) : t("choose_library")}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandEmpty>{t("no_library_found")}</CommandEmpty>
            <CommandGroup>
              {uiLibraries.map((uiLibrary) => (
                <CommandItem
                  key={uiLibrary.uuid}
                  value={uiLibrary.uuid}
                  onSelect={(currentValue) => {
                    setLibrary(currentValue);
                    setOpen(false);
                  }}>
                  {uiLibrary.name}
                  <CheckIcon
                    className={cn("ml-auto h-4 w-4", library === uiLibrary.uuid ? "opacity-100" : "opacity-0")}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

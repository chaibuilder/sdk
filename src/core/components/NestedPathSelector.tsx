"use client";

import { ChevronLeft, ChevronRight, DatabaseIcon } from "lucide-react";
import * as React from "react";

import { useEffect } from "react";
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../ui";

type NestedPathSelectorProps = {
  data: Record<string, any>;
  onSelect: (path: string) => void;
  dataType?: "value" | "array" | "object";
};

type Option = {
  key: string;
  value: any;
  type: "value" | "array" | "object";
};

export function NestedPathSelector({ data, onSelect, dataType = "value" }: NestedPathSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [currentPath, setCurrentPath] = React.useState<string[]>([]);
  const [currentData, setCurrentData] = React.useState<Record<string, any>>(data);

  useEffect(() => {
    if (!open) {
      setCurrentPath([]);
    }
    setCurrentData(data);
  }, [open, data]);

  const getValueType = (value: any): "value" | "array" | "object" => {
    if (Array.isArray(value)) return "array";
    if (typeof value === "object" && value !== null) return "object";
    return "value";
  };

  const handleSelect = React.useCallback(
    (option: Option) => {
      const isValueSelectable = (type: "value" | "array" | "object"): boolean => {
        if (dataType === "value") return type === "value" || type === "object";
        if (dataType === "array") return type === "array";
        return type === dataType;
      };

      if (option.type === "object") {
        setCurrentPath((prev) => [...prev, option.key]);
        setCurrentData(option.value);
      } else if (isValueSelectable(option.type)) {
        onSelect([...currentPath, option.key].join("."));
        setOpen(false);
      }
    },
    [currentPath, onSelect, dataType],
  );

  const handleBack = React.useCallback(() => {
    if (currentPath.length > 0) {
      const newPath = currentPath.slice(0, -1);
      setCurrentPath(newPath);
      setCurrentData(newPath.reduce((acc, key) => acc[key], data));
    }
  }, [currentPath, data]);

  const options: Option[] = React.useMemo(() => {
    return Object.entries(currentData)
      .map(([key, value]) => ({
        key,
        value,
        type: getValueType(value),
      }))
      .filter((option) => {
        if (dataType === "value") return option.type === "value" || option.type === "object";
        if (dataType === "array") return option.type === "array" || option.type === "object";
        if (dataType === "object") return option.type === "object";
        return true;
      });
  }, [currentData, dataType]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="h-5 px-1 py-0 text-[9px] text-muted-foreground"
              role="combobox"
              aria-expanded={open}>
              <DatabaseIcon className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Add field</TooltipContent>
      </Tooltip>

      <PopoverContent className="z-[1000]! relative mr-3 w-[300px] p-0">
        <Command className="fields-command">
          <CommandInput className="border-none" placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup>
              {currentPath.length > 0 && (
                <CommandItem onSelect={handleBack} className="flex items-center text-sm">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </CommandItem>
              )}
              {options.map((option) => (
                <CommandItem
                  value={option.key}
                  key={option.key}
                  disabled={false}
                  onSelect={() => handleSelect(option)}
                  className="flex items-center justify-between">
                  <span>{option.key}</span>
                  <div className="flex items-center gap-2">
                    {dataType === "object" && option.type === "object" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 hover:bg-primary hover:text-primary-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect([...currentPath, option.key].join("."));
                          setOpen(false);
                        }}>
                        Select
                      </Button>
                    )}
                    {(option.type === "object" || option.type === "array") && (
                      <div className="cursor-pointer rounded p-1 hover:bg-muted">
                        <ChevronRight className="h-4 w-4 opacity-50" />
                      </div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

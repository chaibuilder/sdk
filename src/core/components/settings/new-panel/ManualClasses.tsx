import * as React from "react";
import { useState } from "react";
import { first, get, isEmpty, map, reject } from "lodash-es";
// @ts-ignore
import Autosuggest from "react-autosuggest";
import Fuse from "fuse.js";
import { CopyIcon, Cross2Icon, PlusIcon } from "@radix-ui/react-icons";
import { ALL_TW_CLASSES } from "../../../constants/CLASSES_LIST";
import {
  useAddClassesToBlocks,
  useBuilderProp,
  useRemoveClassesFromBlocks,
  useSelectedBlock,
  useSelectedBlockIds,
  useSelectedStylingBlocks,
} from "../../../hooks";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  useToast,
} from "../../../../ui";
import { STYLES_KEY } from "../../../constants/STRINGS.ts";
import { useTranslation } from "react-i18next";
import { SparklesIcon } from "lucide-react";
import { AskAIStyles } from "../AskAiStyle.tsx";

const fuse = new Fuse(ALL_TW_CLASSES, {
  isCaseSensitive: false,
  threshold: 0.2,
  minMatchCharLength: 2,
  keys: ["name"],
});

export function ManualClasses() {
  const { t } = useTranslation();
  const [styleBlock] = useSelectedStylingBlocks();
  const block = useSelectedBlock();
  const addClassesToBlocks = useAddClassesToBlocks();
  const removeClassesFromBlocks = useRemoveClassesFromBlocks();
  const [selectedIds] = useSelectedBlockIds();
  const askAiCallBack = useBuilderProp("askAiCallBack", null);
  const [newCls, setNewCls] = useState("");
  const { toast } = useToast();
  const prop = first(styleBlock)?.prop as string;
  const classes = reject((get(block, prop, "").replace(STYLES_KEY, "").split(",").pop() || "").split(" "), isEmpty);
  const addNewClasses = () => {
    const fullClsNames: string[] = newCls
      .trim()
      .toLowerCase()
      .replace(/ +(?= )/g, "")
      .split(" ");

    addClassesToBlocks(selectedIds, fullClsNames, true);
    setNewCls("");
  };

  const [suggestions, setSuggestions] = useState<any[]>([]);

  const handleSuggestionsFetchRequested = ({ value }: any) => {
    const search = value.trim().toLowerCase();
    const matches = search.match(/.+:/g);
    let classMatches = [];
    if (matches && matches.length > 0) {
      const [prefix] = matches;
      const searchWithoutPrefix = search.replace(prefix, "");
      const fuseResults = fuse.search(searchWithoutPrefix);
      classMatches = fuseResults.map((result: any) => ({
        ...result,
        item: { ...result.item, name: prefix + result.item.name },
      }));
    } else {
      classMatches = fuse.search(search);
    }
    return setSuggestions(map(classMatches, "item"));
  };

  const handleSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestionValue = (suggestion: any) => suggestion.name;

  const renderSuggestion = (suggestion: any) => <div className="rounded-md p-1">{suggestion.name}</div>;

  const inputProps = {
    autoComplete: "off",
    autoCorrect: "off",
    autoCapitalize: "off",
    spellCheck: false,
    placeholder: t("enter_classes_separated_by_space"),
    value: newCls,
    onKeyDown: (e: any) => {
      if (e.key === "Enter" && newCls.trim() !== "") {
        addNewClasses();
      }
    },
    onChange: (_e: any, { newValue }: any) => setNewCls(newValue),
    className: "w-full rounded-md text-xs px-2 hover:outline-0 bg-background border-border py-1",
  };

  const onClickCopy = () => {
    if (navigator.clipboard === undefined) {
      toast({
        title: t("clipboard_not_supported"),
        description: t("please_use_chrome_firefox_or_safari"),
        variant: "destructive",
      });
      return;
    }
    navigator.clipboard.writeText(classes.join(" "));
    toast({
      title: t("copied"),
      description: t("classes_copied_to_clipboard"),
    });
  };

  return (
    <div
      className={`flex ${
        suggestions.length > 0 ? "min-h-[300px]" : "min-h-max"
      } w-full flex-col gap-y-1.5 overflow-y-auto pb-4`}>
      <div className="flex items-center justify-between gap-x-2">
        <div className="flex items-center gap-x-2 text-muted-foreground">
          <span>{t("classes")}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <CopyIcon onClick={onClickCopy} className={"cursor-pointer"} />
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("copy_classes_to_clipboard")}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        {askAiCallBack ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="default" className="h-6 w-fit" size="sm">
                <SparklesIcon className="h-4 w-4" />
                <span className="ml-2">{t("Ask AI")}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent side="left" className="p-2">
              <AskAIStyles blockId={block?._id} />
            </PopoverContent>
          </Popover>
        ) : null}
      </div>
      <div className={"relative flex items-center gap-x-3"}>
        <div className="relative flex w-full items-center gap-x-3">
          <Autosuggest
            suggestions={suggestions}
            onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
            onSuggestionsClearRequested={handleSuggestionsClearRequested}
            getSuggestionValue={getSuggestionValue}
            renderSuggestion={renderSuggestion}
            inputProps={inputProps}
            containerProps={{
              className: "relative h-8 w-full gap-y-1 py-1 border-border",
            }}
            theme={{
              suggestion: "bg-transparent",
              suggestionHighlighted: "!bg-gray-300 dark:!bg-gray-800 cursor-pointer",
              suggestionsContainerOpen:
                "absolute bg-background no-scrollbar z-50 max-h-[230px] overflow-y-auto w-full  border border-border rounded-md",
            }}></Autosuggest>
        </div>
        <Button
          variant="outline"
          className="h-6 border-border"
          onClick={addNewClasses}
          disabled={newCls.trim() === ""}
          size="sm">
          <PlusIcon />
        </Button>
      </div>
      <div className="flex w-full flex-wrap gap-2 overflow-x-hidden">
        {React.Children.toArray(
          classes.map((cls: string) => (
            <div
              key={cls}
              className="group relative flex max-w-[260px] cursor-default items-center gap-x-1 truncate rounded border border-border bg-gray-200 p-px px-1.5 text-[11px] text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {cls}
              <Cross2Icon
                onClick={() => removeClassesFromBlocks(selectedIds, [cls])}
                className="invisible absolute right-1 rounded-full bg-red-400 hover:text-white group-hover:visible group-hover:cursor-pointer"
              />
            </div>
          )),
        )}
      </div>
    </div>
  );
}

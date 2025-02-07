import { CopyIcon, Cross2Icon, PlusIcon } from "@radix-ui/react-icons";
import { first, get, isEmpty, map } from "lodash-es";
import { SparklesIcon } from "lucide-react";
import { useState } from "react";
import Autosuggest from "react-autosuggest";
import { useTranslation } from "react-i18next";
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
import { useFuseSearch } from "../../../constants/CLASSES_LIST";
import {
  useAddClassesToBlocks,
  useBuilderProp,
  useRemoveClassesFromBlocks,
  useSelectedBlock,
  useSelectedBlockIds,
  useSelectedStylingBlocks,
} from "../../../hooks";
import { getSplitChaiClasses } from "../../../hooks/getSplitClasses.ts";
import { AskAIStyles } from "../AskAiStyle.tsx";

export function ManualClasses() {
  const fuse = useFuseSearch();
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
  // const {classes} = reject((get(block, prop, "").replace(STYLES_KEY, "").split(",").pop() || "").split(" "), isEmpty);
  const { classes: classesString } = getSplitChaiClasses(get(block, prop, ""));
  const classes = classesString.split(" ").filter((cls) => !isEmpty(cls));

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

  const renderSuggestion = (suggestion: any) => <div className="p-1 rounded-md">{suggestion.name}</div>;

  const inputProps = {
    autoComplete: "off",
    autoCorrect: "off",
    autoCapitalize: "off",
    spellCheck: false,
    placeholder: t("Enter classes separated by space"),
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
        title: t("Clipboard not supported"),
        description: t("Please use Chrome, Firefox or Safari"),
        variant: "destructive",
      });
      return;
    }
    navigator.clipboard.writeText(classes.join(" "));
    toast({
      title: t("Copied"),
      description: t("Classes copied to clipboard"),
    });
  };

  return (
    <div className={`flex w-full flex-col gap-y-1.5 pb-4`}>
      <div className="flex items-center justify-between gap-x-2">
        <div className="flex items-center gap-x-2 text-muted-foreground">
          <span>{t("Classes")}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <CopyIcon onClick={onClickCopy} className={"cursor-pointer"} />
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("Copy classes to clipboard")}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        {askAiCallBack ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="default" className="h-6 w-fit" size="sm">
                <SparklesIcon className="w-4 h-4" />
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
        <div className="relative flex items-center w-full gap-x-3">
          <Autosuggest
            suggestions={suggestions}
            onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
            onSuggestionsClearRequested={handleSuggestionsClearRequested}
            getSuggestionValue={getSuggestionValue}
            renderSuggestion={renderSuggestion}
            inputProps={inputProps}
            containerProps={{
              className: "relative h-8 w-full gap-y-1 py-1 border-border text-xs",
            }}
            theme={{
              suggestion: "bg-transparent",
              suggestionHighlighted: "!bg-gray-300 dark:!bg-gray-800 cursor-pointer",
              suggestionsContainerOpen:
                "absolute bg-background no-scrollbar z-50 max-h-[230px] overflow-y-auto w-full  border border-border rounded-md",
            }}
          />
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
      <div className="flex flex-wrap w-full gap-2 overflow-x-hidden">
        {classes.map((cls: string) => (
          <div
            key={cls}
            className="group relative flex max-w-[260px] cursor-default items-center gap-x-1 truncate break-words rounded border border-border bg-gray-200 p-px px-1.5 text-[11px] text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {cls}
            <Cross2Icon
              onClick={() => removeClassesFromBlocks(selectedIds, [cls])}
              className="absolute invisible bg-red-400 rounded-full right-1 hover:text-white group-hover:visible group-hover:cursor-pointer"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

import { filter, first, get, groupBy, has, isArray, isEmpty, keys, map, mergeWith, noop, values } from "lodash-es";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  useAddBlock,
  useBuilderProp,
  useSelectedBlockIds,
  useTranslation,
  useUILibraryBlocks,
} from "../../../../hooks";
import { syncBlocksWithDefaults, useChaiBlocks } from "@chaibuilder/runtime";
import { Loader } from "lucide-react";
import { useAtom } from "jotai";

import { activePanelAtom } from "../../../../atoms/ui.ts";
import { OUTLINE_KEY } from "../../../../constants/STRINGS.ts";
import { CaretRightIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import { ScrollArea } from "../../../../../ui";
import { cn } from "../../../../functions/Functions.ts";

const BlockCard = ({ block, closePopover }: { block: any; closePopover: () => void }) => {
  const [isAdding, setIsAdding] = useState(false);
  const getExternalPredefinedBlock = useBuilderProp("getExternalPredefinedBlock", noop());
  const { addCoreBlock, addPredefinedBlock } = useAddBlock();
  const [ids] = useSelectedBlockIds();

  const addBlock = useCallback(
    async (e: any) => {
      e.stopPropagation();
      if (has(block, "component")) {
        addCoreBlock(block, first(ids));
        closePopover();
        return;
      }
      setIsAdding(true);
      const uiBlocks = await getExternalPredefinedBlock(block);
      if (!isEmpty(uiBlocks)) addPredefinedBlock(syncBlocksWithDefaults(uiBlocks), first(ids));
      closePopover();
    },
    [block],
  );

  return (
    <>
      <div
        onClick={isAdding ? () => {} : addBlock}
        className="relative mt-2 cursor-pointer overflow-hidden rounded-md border border-gray-300 bg-white duration-200 hover:border-blue-500 hover:shadow-xl">
        {isAdding && (
          <div className="absolute flex h-full w-full items-center justify-center bg-black/70">
            <Loader className="animate-spin" size={15} color="white" />{" "}
            <span className="pl-2 text-sm text-white">Adding...</span>
          </div>
        )}
        {block.preview ? (
          <img src={block.preview} className="min-h-[25px] w-full rounded-md" alt={block.label} />
        ) : (
          <div className="flex h-20 items-center justify-center rounded-md border border-border border-gray-300 bg-gray-200">
            <p className={"max-w-xs text-center text-sm text-gray-700"}>{block.label}</p>
          </div>
        )}
      </div>
    </>
  );
};

const UILibrariesPanel = () => {
  const { data: predefinedBlocks } = useUILibraryBlocks();
  const chaiBlocks = useChaiBlocks();
  const customBlocks = filter(values(chaiBlocks), { category: "custom" });
  const customGroupsList: Record<string, any[]> = groupBy(customBlocks, "group");
  const groupsList: Record<string, any[]> = groupBy(predefinedBlocks, "group");
  const mergedGroups = useMemo(() => {
    return mergeWith(customGroupsList, groupsList, (a: any, b: any) => {
      // Concatenate arrays for the same key
      if (isArray(a) && isArray(b)) return [...a, ...b];
    });
  }, [customGroupsList, groupsList]);

  const [selectedGroup, setGroup] = useState(first(keys(mergedGroups)) || "");
  const [, setActivePanel] = useAtom(activePanelAtom);
  const blocks = get(mergedGroups, selectedGroup, []);
  const { t } = useTranslation();
  const timeoutRef = useRef(null);

  const handleMouseEnter = (group) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    timeoutRef.current = setTimeout(() => {
      if (!timeoutRef.current) return;
      setGroup(group);
    }, 300);
  };

  return (
    <>
      <div className="relative flex h-full max-h-full overflow-hidden">
        <div className="z-20 flex h-full max-h-full w-40 flex-col overflow-hidden bg-white">
          <div className="mb-2 flex flex-col justify-between rounded-md bg-background/30 p-1">
            <h1 className="flex w-full flex-col items-baseline truncate px-1 text-sm font-semibold xl:flex-col">
              {t("Library")}:&nbsp;{t("Preline UI")}
            </h1>
            <span className="p-0 text-[9px] font-light leading-3 opacity-80 xl:pl-1">
              {t("Click to add blocks to page")}
            </span>
          </div>
          <hr />
          <div className={"sticky top-0 mt-2 flex h-full w-full flex-col items-center gap-1 px-1"}>
            {React.Children.toArray(
              map(mergedGroups, (_groupedBlocks, group) => (
                <div
                  onMouseEnter={() => handleMouseEnter(group)}
                  onMouseLeave={() => clearTimeout(timeoutRef.current)}
                  key={group}
                  onClick={() => setGroup(group)}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between rounded-md p-1 text-sm transition-all ease-in-out hover:bg-gray-200",
                    group === selectedGroup ? "bg-blue-500 text-white hover:bg-blue-600" : "",
                  )}>
                  <span>{group}</span>
                  <CaretRightIcon className="ml-2 h-5 w-5" />
                </div>
              )),
            )}
          </div>
        </div>
        <div
          onMouseEnter={() => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
          }}
          className={clsx(
            "fixed top-0 z-10 flex h-full max-h-full w-80 flex-col gap-2 border-l border-gray-300 bg-white px-2 py-2 transition-all ease-linear",
            selectedGroup ? "translate-x-40" : "-z-10 -translate-x-40",
          )}>
          <div className="h--[90%] w-full overflow-hidden">
            <ScrollArea className="h-full space-y-2 px-2">
              {React.Children.toArray(
                blocks.map((block) => <BlockCard block={block} closePopover={() => setActivePanel(OUTLINE_KEY)} />),
              )}
              <br />
              <br />
              <br />
            </ScrollArea>
          </div>
        </div>
      </div>
    </>
  );
};

export default UILibrariesPanel;

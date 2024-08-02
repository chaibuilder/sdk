import { filter, first, get, groupBy, has, isArray, isEmpty, keys, map, mergeWith, noop, values } from "lodash-es";
import React, { useCallback, useMemo, useState } from "react";
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
        className="relative cursor-pointer overflow-hidden rounded-md border border-transparent duration-200 hover:scale-x-105 hover:border-foreground/20 hover:shadow-2xl">
        {isAdding && (
          <div className="absolute flex h-full w-full items-center justify-center bg-black bg-opacity-70">
            <Loader className="animate-spin" size={15} color="white" />{" "}
            <span className="pl-2 text-sm text-white">Adding...</span>
          </div>
        )}
        {block.preview ? (
          <img
            src={block.preview}
            className="min-h-[50px] w-full rounded-md border border-gray-300"
            alt={block.label}
          />
        ) : (
          <div className="flex h-20 items-center justify-center rounded-md border border-border border-gray-300 bg-gray-200">
            <p className={"max-w-xs text-center text-sm text-gray-700"}>{block.label}</p>
          </div>
        )}
      </div>
    </>
  );
};

const PanelPredefinedBlocks = () => {
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
  const [hoverGroup, setHoverGroup] = useState(false);
  const blocks = get(mergedGroups, selectedGroup, []);
  const { t } = useTranslation();

  return (
    <>
      <div className="relative flex h-full max-h-full overflow-hidden">
        <div className="z-20 flex h-full max-h-full w-60 flex-col overflow-hidden bg-white">
          <div className="mb-2 flex flex-col justify-between rounded-md bg-background/30 p-1">
            <h1 className="flex flex-col items-baseline px-1 text-xl font-semibold xl:flex-col">{t("ui_library")}</h1>
            <span className="p-0 text-xs font-light leading-3 opacity-80 xl:pl-1">
              {t("(Click to add custom blocks to page)")}
            </span>
          </div>
          <div className={"sticky top-0 flex w-full flex-col items-center gap-1 px-1"}>
            {React.Children.toArray(
              map(mergedGroups, (_groupedBlocks, group) => (
                <div
                  data-block-group={group}
                  onMouseOver={() => {
                    setTimeout(() => setHoverGroup(true), 500);
                  }}
                  key={group}
                  className="flex h-10 w-full items-center justify-between rounded-md border-2 border-zinc-200 p-2 text-sm transition-all ease-in-out hover:bg-zinc-200 hover:shadow-md">
                  <span>{group}</span>
                  <CaretRightIcon className="ml-2 h-5 w-5" />
                </div>
              )),
            )}
          </div>
        </div>
        <div
          className={clsx(
            "fixed top-0 z-10 flex h-full max-h-full w-60 flex-col gap-2 bg-white px-2 py-2 transition-all ease-linear",
            hoverGroup && "translate-x-60",
          )}>
          <div className="h-full w-full space-y-2 overflow-y-auto px-2">
            {React.Children.toArray(
              blocks.map((block) => <BlockCard block={block} closePopover={() => setActivePanel(OUTLINE_KEY)} />),
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PanelPredefinedBlocks;

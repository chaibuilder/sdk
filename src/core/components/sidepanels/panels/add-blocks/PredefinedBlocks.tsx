import { filter, first, get, groupBy, has, isArray, isEmpty, keys, map, mergeWith, noop, values } from "lodash-es";
import React, { useCallback, useMemo, useState } from "react";
import { useAddBlock, useBuilderProp, useSelectedBlockIds, useUILibraryBlocks } from "../../../../hooks";
import { syncBlocksWithDefaults, useChaiBlocks } from "@chaibuilder/runtime";
import { Loader } from "lucide-react";
import { useAtom } from "jotai";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../ui";
import { activePanelAtom } from "../../../../atoms/ui.ts";
import { OUTLINE_KEY } from "../../../../constants/STRINGS.ts";

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

const PredefinedBlocks = () => {
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

  return (
    <div className="relative flex h-full max-h-full flex-col overflow-hidden py-2">
      <div className={"sticky top-0 flex w-full items-center p-3"}>
        <Select value={selectedGroup} onValueChange={(value) => setGroup(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Choose</SelectItem>
            {React.Children.toArray(
              map(mergedGroups, (_groupedBlocks, group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              )),
            )}
          </SelectContent>
        </Select>
      </div>
      <div className="h-full w-full space-y-2 overflow-y-auto px-2">
        {React.Children.toArray(
          blocks.map((block) => <BlockCard block={block} closePopover={() => setActivePanel(OUTLINE_KEY)} />),
        )}
      </div>
    </div>
  );
};

export default PredefinedBlocks;
import { filter, first, get, groupBy, has, isArray, isEmpty, keys, map, mergeWith, values } from "lodash-es";
import React, { useCallback, useMemo, useState } from "react";
import { useAddBlock, useBuilderProp, useSelectedBlockIds, useUILibraryBlocks } from "../../../../hooks";
import { syncBlocksWithDefaults, useChaiBlocks } from "@chaibuilder/runtime";
import { Loader } from "lucide-react";
import { DragPreviewImage, useDrag } from "react-dnd";
import { useAtom } from "jotai";
import { addBlocksModalAtom } from "../../../../atoms/blocks";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../ui";

const BlockCard = ({ block, closePopover }: { block: any; closePopover: () => void }) => {
  const [isAdding, setIsAdding] = useState(false);
  const getExternalPredefinedBlock = useBuilderProp("getExternalPredefinedBlock");
  const { addCoreBlock, addPredefinedBlock } = useAddBlock();
  const [ids] = useSelectedBlockIds();

  const [, drag, dragPreview] = useDrag(
    () => ({
      type: "CHAI_BLOCK",
      item: block,
    }),
    [block],
  );

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
      <DragPreviewImage
        connect={dragPreview}
        src={"https://placehold.co/100x30/000000/FFF?text=" + (block.name || block.label)?.replace(" ", "+")}
      />
      <div
        ref={drag}
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

export const PredefinedBlocks = () => {
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

  const [, setAddBlocks] = useAtom(addBlocksModalAtom);
  const [selectedGroup, setGroup] = useState(first(keys(mergedGroups)) || "");
  const blocks = get(mergedGroups, selectedGroup, []);

  return (
    <div className="relative flex flex-col h-full max-h-full overflow-hidden py-2">
      <div className={"p-3 sticky top-0 flex w-full items-center"}>
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
          blocks.map((block) => <BlockCard block={block} closePopover={() => setAddBlocks(false)} />),
        )}
      </div>
    </div>
  );
};

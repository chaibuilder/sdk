import { capitalize, first, get, groupBy, has, isEmpty, map, noop, values } from "lodash-es";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAddBlock, useBuilderProp, useHighlightBlockId, useSelectedBlockIds } from "../../../../hooks";
import { syncBlocksWithDefaults, useChaiBlocks } from "@chaibuilder/runtime";
import { Loader } from "lucide-react";
import { atom, useAtom } from "jotai";
import { cn } from "../../../../functions/Functions.ts";
import { CaretRightIcon } from "@radix-ui/react-icons";
import { ScrollArea, Skeleton, Tooltip, TooltipContent, TooltipTrigger } from "../../../../../ui";
import { UILibrary, UiLibraryBlock } from "../../../../types/chaiBuilderEditorProps.ts";
import { ChaiBlock } from "../../../../types/ChaiBlock.ts";
import { UILibrariesSelect } from "./UiLibrariesSelect.tsx";
import { useFeature } from "flagged";

import { draggedBlockAtom } from "../../../canvas/dnd/atoms.ts";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useAddBlocksModal } from "../../../../hooks/useAddBlocks.ts";
import { selectedLibraryAtom } from "../../../../atoms/ui.ts";

const BlockCard = ({
  block,
  closePopover,
  library,
}: {
  library: UILibrary;
  // TODO: I think it should be "block: UiLibraryBlock | ChaiBuilderBlock"
  block: UiLibraryBlock;
  closePopover: () => void;
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const getUILibraryBlock = useBuilderProp("getUILibraryBlock", noop);
  const { addCoreBlock, addPredefinedBlock } = useAddBlock();
  const [ids, setSelected] = useSelectedBlockIds();
  const [, setHighlighted] = useHighlightBlockId();
  const name = get(block, "name", get(block, "label"));
  const dnd = useFeature("dnd");
  const [, setDraggedBlock] = useAtom(draggedBlockAtom);

  const isTopLevelSection = (block: ChaiBlock) => {
    const isPageSection = has(block, "styles_attrs.data-page-section");
    return block._type === "Box" && isPageSection;
  };

  const addBlock = useCallback(
    async (e: any) => {
      e.stopPropagation();
      if (has(block, "component")) {
        addCoreBlock(block, first(ids));
        closePopover();
        return;
      }
      setIsAdding(true);
      const uiBlocks = await getUILibraryBlock(library, block);
      let parent = first(ids);
      if (isTopLevelSection(first(uiBlocks))) {
        parent = null;
      }
      if (!isEmpty(uiBlocks)) addPredefinedBlock(syncBlocksWithDefaults(uiBlocks), parent);
      closePopover();
    },
    [block],
  );

  const handleDragStart = async (ev) => {
    const uiBlocks = await getUILibraryBlock(library, block);
    let parent = first(ids);
    if (isTopLevelSection(first(uiBlocks))) {
      parent = null;
    }

    if (!isEmpty(uiBlocks)) {
      const convertedBlock = { blocks: uiBlocks, uiLibrary: true, parent: parent };
      ev.dataTransfer.setData("text/plain", JSON.stringify(convertedBlock));

      if (block.preview) {
        const img = new Image();
        img.src = block.preview;
        img.onload = () => {
          ev.dataTransfer.setDragImage(img, 0, 0);
        };
      } else {
        ev.dataTransfer.setDragImage(new Image(), 0, 0);
      }

      //@ts-ignore
      setDraggedBlock(convertedBlock);
      setTimeout(() => {
        setSelected([]);
        setHighlighted(null);
        closePopover();
      }, 200);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          onClick={isAdding ? () => {} : addBlock}
          draggable={dnd ? "true" : "false"}
          onDragStart={handleDragStart}
          className={clsx(
            "relative mt-2 cursor-pointer overflow-hidden rounded-md border border-gray-300 bg-white duration-200 hover:border-blue-500 hover:shadow-xl",
          )}>
          {isAdding && (
            <div className="absolute flex h-full w-full items-center justify-center bg-black/70">
              <Loader className="animate-spin" size={15} color="white" />
              <span className="pl-2 text-sm text-white">Adding...</span>
            </div>
          )}
          {block.preview ? (
            <img src={block.preview} className="min-h-[45px] w-full rounded-md" alt={name} />
          ) : (
            <div className="flex h-20 items-center justify-center rounded-md border border-border border-gray-300 bg-gray-200">
              <p className="max-w-xs text-center text-sm text-gray-700">{name}</p>
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{name}</p>
      </TooltipContent>
    </Tooltip>
  );
};

const libraryBlocksAtom = atom<{ [uuid: string]: { loading: "idle" | "loading" | "complete"; blocks: any[] | null } }>(
  {},
);

const useLibraryBlocks = (library?: UILibrary) => {
  const [libraryBlocks, setLibraryBlocks] = useAtom(libraryBlocksAtom);
  const getBlocks = useBuilderProp("getUILibraryBlocks", noop);
  const blocks = get(libraryBlocks, `${library?.uuid}.blocks`, null);
  const state = get(libraryBlocks, `${library?.uuid}.loading`, "idle");
  const loadingRef = useRef("idle");
  useEffect(() => {
    (async () => {
      if (state === "complete" || loadingRef.current === "loading") return;
      loadingRef.current = "loading";
      setLibraryBlocks((prev) => ({ ...prev, [library?.uuid]: { loading: "loading", blocks: [] } }));
      const libraryBlocks: UiLibraryBlock[] = await getBlocks(library);
      loadingRef.current = "idle";
      setLibraryBlocks((prev) => ({ ...prev, [library?.uuid]: { loading: "complete", blocks: libraryBlocks || [] } }));
    })();
  }, [library, blocks, state, loadingRef]);

  return { data: blocks || [], isLoading: state === "loading" };
};

const UILibrarySection = () => {
  const [selectedLibrary, setLibrary] = useAtom(selectedLibraryAtom);
  const uiLibraries = useBuilderProp("uiLibraries", []);
  const registeredBlocks = useChaiBlocks();
  const customBlocks = values(registeredBlocks).filter((block) => block.category === "custom");
  const library = uiLibraries.find((library) => library.uuid === selectedLibrary) || first(uiLibraries);
  const { data: libraryBlocks, isLoading } = useLibraryBlocks(library);

  const mergedGroups = groupBy([...libraryBlocks, ...customBlocks], "group");
  const [selectedGroup, setGroup] = useState("Hero");
  const blocks = get(mergedGroups, selectedGroup, []);
  const timeoutRef = useRef(null);
  const [, setOpen] = useAddBlocksModal();
  const { t } = useTranslation();

  const handleMouseEnter = (group: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    timeoutRef.current = setTimeout(() => {
      if (!timeoutRef.current) return;
      setGroup(group);
    }, 300);
  };

  if (isLoading) return <Skeleton className="h-full w-full" />;

  return (
    <>
      <div className="relative flex h-full max-h-full flex-col overflow-hidden bg-background">
        <div className={"flex h-full pt-2"}>
          <div className={"flex h-full w-52 flex-col gap-1 px-1"}>
            <UILibrariesSelect library={library?.uuid} setLibrary={setLibrary} uiLibraries={uiLibraries} />
            <div className="mt-2 flex flex-col">
              <span className="text-xs font-bold text-gray-500">{t("Groups")}</span>
              <hr />
              <ScrollArea className="h-full flex-1 overflow-y-auto">
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
                      <span>{capitalize(group)}</span>
                      <CaretRightIcon className="ml-2 h-5 w-5" />
                    </div>
                  )),
                )}
              </ScrollArea>
            </div>
          </div>
          <ScrollArea
            onMouseEnter={() => (timeoutRef.current ? clearTimeout(timeoutRef.current) : null)}
            className="z-10 -mt-2 flex h-full max-h-full w-full flex-col gap-2 border-l border-gray-300 transition-all ease-linear">
            <div className="grid grid-cols-2 gap-2 px-2">
              {React.Children.toArray(
                blocks.map((block: UiLibraryBlock) => (
                  <BlockCard block={block} library={library} closePopover={() => setOpen("")} />
                )),
              )}
            </div>
            <br />
            <br />
            <br />
          </ScrollArea>
        </div>
      </div>
    </>
  );
};

const UILibrariesPanel = () => {
  return <UILibrarySection />;
};

export default UILibrariesPanel;

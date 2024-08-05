import { first, get, has, isEmpty, noop } from "lodash-es";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAddBlock, useBuilderProp, useSelectedBlockIds, useTranslation } from "../../../../hooks";
import { syncBlocksWithDefaults } from "@chaibuilder/runtime";
import { Loader } from "lucide-react";
import { atom, useAtom } from "jotai";

import { activePanelAtom } from "../../../../atoms/ui.ts";
import { cn } from "../../../../functions/Functions.ts";
import { CaretRightIcon } from "@radix-ui/react-icons";
import { ScrollArea, Skeleton } from "../../../../../ui";
import { OUTLINE_KEY } from "../../../../constants/STRINGS.ts";
import { groupBy, map } from "lodash";
import { UILibrary, UiLibraryBlock } from "../../../../types/chaiBuilderEditorProps.ts";

const BlockCard = ({
  block,
  closePopover,
  library,
}: {
  library: UILibrary;
  block: UiLibraryBlock;
  closePopover: () => void;
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const getUILibraryBlock = useBuilderProp("getUILibraryBlock", noop);
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
      const uiBlocks = await getUILibraryBlock(library, block);
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
          <img src={block.preview} className="min-h-[25px] w-full rounded-md" alt={block.name} />
        ) : (
          <div className="flex h-20 items-center justify-center rounded-md border border-border border-gray-300 bg-gray-200">
            <p className={"max-w-xs text-center text-sm text-gray-700"}>{block.name}</p>
          </div>
        )}
      </div>
    </>
  );
};

const useLibraryBlocks = (library?: UILibrary) => {
  const getBlocks = useBuilderProp("getUILibraryBlocks", noop);
  const [blocks, setBlocks] = useState<UiLibraryBlock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    (async () => {
      if (!library) return;
      setIsLoading(true);
      const libraryBlocks: UiLibraryBlock[] = await getBlocks(library);
      setBlocks(libraryBlocks);
      setIsLoading(false);
    })();
  }, []);
  return { data: blocks, isLoading };
};

const selectedLibraryAtom = atom<string>("");
const UILibrarySection = () => {
  const [selectedLibrary] = useAtom(selectedLibraryAtom);
  const uiLibraries = useBuilderProp("uiLibraries", []);
  const library = uiLibraries.find((library) => library.uuid === selectedLibrary) || first(uiLibraries);
  const { data: libraryBlocks, isLoading } = useLibraryBlocks(library);

  const mergedGroups = groupBy(libraryBlocks, "group");
  const [selectedGroup, setGroup] = useState("Hero");
  const [, setActivePanel] = useAtom(activePanelAtom);
  const blocks = get(mergedGroups, selectedGroup, []);
  const { t } = useTranslation();
  const timeoutRef = useRef(null);

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
      <div className="relative flex h-full max-h-full w-[460px] flex-col overflow-hidden bg-background">
        <div className="sticky top-0 flex h-fit flex-col">
          <div className="mb-2 flex flex-col justify-between rounded-md bg-background/30 p-1">
            <h1 className="flex w-full flex-col items-baseline truncate px-1 text-sm font-semibold xl:flex-col">
              {t("Library")}:&nbsp;{library.name}
            </h1>
            <span className="p-0 text-[9px] font-light leading-3 opacity-80 xl:pl-1">
              {t("Click to add blocks to page")}
            </span>
          </div>
        </div>
        <div className={"flex h-[95%] border-t border-gray-300 pt-2"}>
          <div className={"flex h-full w-40 flex-col gap-1 px-1"}>
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
          <ScrollArea
            onMouseEnter={() => (timeoutRef.current ? clearTimeout(timeoutRef.current) : null)}
            className="z-10 -mt-2 flex h-full max-h-full w-[300px] flex-col gap-2 border-l border-gray-300 px-2 transition-all ease-linear">
            {React.Children.toArray(
              blocks.map((block: UiLibraryBlock) => (
                <BlockCard block={block} library={library} closePopover={() => setActivePanel(OUTLINE_KEY)} />
              )),
            )}
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

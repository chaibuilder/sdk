import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { capitalize, debounce, filter, find, map, reject, sortBy, values } from "lodash-es";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Input, ScrollArea, Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../ui";
import { showPredefinedBlockCategoryAtom } from "../../../../atoms/ui";
import { canAcceptChildBlock, canBeNestedInside } from "../../../../functions/block-helpers.ts";
import { useBlocksStore, useBuilderProp, usePermissions } from "../../../../hooks";
import { usePartialBlocksList } from "../../../../hooks/usePartialBlocksStore";
import { CHAI_BUILDER_EVENTS, mergeClasses, PERMISSIONS, UILibraries } from "../../../../main";
import { pubsub } from "../../../../pubsub.ts";
import { CoreBlock } from "./CoreBlock";
import { DefaultChaiBlocks } from "./DefaultBlocks.tsx";
import ImportHTML from "./ImportHTML";
import { PartialBlocks } from "./PartialBlocks";

const CORE_GROUPS = ["basic", "typography", "media", "layout", "form", "advanced", "other"];

export const ChaiBuilderBlocks = ({ groups, blocks, parentId, position, gridCols = "grid-cols-4" }: any) => {
  const { t } = useTranslation();
  const [allBlocks] = useBlocksStore();
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [tab] = useAtom(addBlockTabAtom);
  const parentType = find(allBlocks, (block) => block._id === parentId)?._type;
  const [selectedGroup, setSelectedGroup] = useState<string | null>("all");
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const debouncedSelectRef = useRef<any>(null);

  // Focus search input on mount and tab change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [tab]);

  // Reset to "all" when searching
  useEffect(() => {
    if (searchTerm) {
      setSelectedGroup("all");
      setHoveredGroup(null);
    }
  }, [searchTerm]);

  // Initialize debounced function
  useEffect(() => {
    debouncedSelectRef.current = debounce((group: string) => {
      setSelectedGroup(group);
    }, 500);

    return () => {
      if (debouncedSelectRef.current) {
        debouncedSelectRef.current.cancel();
      }
    };
  }, []);

  // Handle hover - update hovered group immediately but debounce the selection
  const handleGroupHover = useCallback((group: string) => {
    setHoveredGroup(group);
    if (debouncedSelectRef.current) {
      debouncedSelectRef.current(group);
    }
  }, []);

  // Handle mouse leave - clear hovered group
  const handleGroupLeave = useCallback(() => {
    setHoveredGroup(null);
    if (debouncedSelectRef.current) {
      debouncedSelectRef.current.cancel();
    }
  }, []);

  // Immediate selection on click
  const handleGroupClick = useCallback((group: string) => {
    if (debouncedSelectRef.current) {
      debouncedSelectRef.current.cancel();
    }
    setSelectedGroup(group);
    setHoveredGroup(null);
  }, []);

  const filteredBlocks = useMemo(
    () =>
      searchTerm
        ? values(blocks).filter((block: any) =>
            (block.label?.toLowerCase() + " " + block.type?.toLowerCase()).includes(searchTerm.toLowerCase()),
          )
        : blocks,
    [blocks, searchTerm],
  );

  const filteredGroups = useMemo(
    () =>
      searchTerm
        ? groups.filter(
            (group: string) => reject(filter(values(filteredBlocks), { group }), { hidden: true }).length > 0,
          )
        : groups.filter((group: string) => reject(filter(values(blocks), { group }), { hidden: true }).length > 0),
    [blocks, filteredBlocks, groups, searchTerm],
  );

  const sortedGroups = useMemo(
    () =>
      sortBy(filteredGroups, (group: string) => (CORE_GROUPS.indexOf(group) === -1 ? 99 : CORE_GROUPS.indexOf(group))),
    [filteredGroups],
  );

  // Filter blocks based on selected group
  const displayedBlocks = useMemo(() => {
    if (selectedGroup === "all") {
      return filteredBlocks;
    }
    return filter(values(filteredBlocks), { group: selectedGroup });
  }, [filteredBlocks, selectedGroup]);

  // Filter groups for display based on selected group
  const displayedGroups = useMemo(() => {
    if (selectedGroup === "all") {
      return sortedGroups;
    }
    return [selectedGroup];
  }, [sortedGroups, selectedGroup]);

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col">
      {/* Search at top */}
      <div className="sticky top-0 z-10 bg-background/80 px-4 py-2 backdrop-blur-sm">
        <Input
          ref={searchInputRef}
          type="search"
          placeholder={t("Search blocks...")}
          value={searchTerm}
          className="-ml-2"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="sticky top-10 flex h-[calc(100%-48px)] overflow-hidden">
        {/* Sidebar for groups */}
        {sortedGroups.length > 0 && (
          <div className="w-1/4 min-w-[120px] border-r">
            <ScrollArea className="h-full">
              <div className="space-y-1 p-2">
                <button
                  key="sidebar-all"
                  onClick={() => handleGroupClick("all")}
                  onMouseEnter={() => handleGroupHover("all")}
                  onMouseLeave={handleGroupLeave}
                  className={`w-full rounded-md px-2 py-1.5 text-left text-sm font-medium ${
                    selectedGroup === "all" || hoveredGroup === "all"
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50 hover:text-accent-foreground"
                  }`}>
                  {t("All")}
                </button>
                {sortedGroups.map((group) => (
                  <button
                    key={`sidebar-${group}`}
                    onClick={() => handleGroupClick(group)}
                    onMouseEnter={() => handleGroupHover(group)}
                    onMouseLeave={handleGroupLeave}
                    className={`w-full rounded-md px-2 py-1.5 text-left text-sm ${
                      selectedGroup === group || hoveredGroup === group
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50 hover:text-accent-foreground"
                    }`}>
                    {capitalize(t(group.toLowerCase()))}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Main content area */}
        <div className="h-full w-3/4 flex-1 overflow-hidden">
          <ScrollArea id="add-blocks-scroll-area" className="no-scrollbar mr-4 h-full">
            {filteredGroups.length === 0 && searchTerm ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <p>
                  {t("No blocks found matching")} "{searchTerm}"
                </p>
              </div>
            ) : (
              <div className="space-y-6 p-4">
                {displayedGroups.map((group) => (
                  <div key={group} className="space-y-3">
                    <h3 className="px-1 text-sm font-medium">{capitalize(t(group.toLowerCase()))}</h3>
                    <div className={"grid gap-2 " + gridCols}>
                      {React.Children.toArray(
                        reject(
                          selectedGroup === "all"
                            ? filter(values(displayedBlocks), { group })
                            : values(displayedBlocks),
                          { hidden: true },
                        ).map((block) => (
                          <CoreBlock
                            key={block.type}
                            parentId={parentId}
                            position={position}
                            block={block}
                            disabled={
                              !canAcceptChildBlock(parentType, block.type) || !canBeNestedInside(parentType, block.type)
                            }
                          />
                        )),
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

const addBlockTabAtom = atomWithStorage<string>("__add_block_tab", "library");

const AddBlocksPanel = ({
  className,
  showHeading = true,
  parentId = undefined,
  position = -1,
}: {
  parentId?: string;
  showHeading?: boolean;
  className?: string;
  position?: number;
}) => {
  const { t } = useTranslation();
  const [tab, setTab] = useAtom(addBlockTabAtom);
  const [, setCategory] = useAtom(showPredefinedBlockCategoryAtom);
  const importHTMLSupport = useBuilderProp("importHTMLSupport", true);
  const addBlocksDialogTabs = useBuilderProp("addBlocksDialogTabs", []);
  const { data: partialBlocksList } = usePartialBlocksList();
  const hasPartialBlocks = Object.keys(partialBlocksList || {}).length > 0;
  const { hasPermission } = usePermissions();

  // If current tab is "partials" but there are no partial blocks, switch to "library" tab
  useEffect(() => {
    if (tab === "partials" && !hasPartialBlocks) {
      setTab("library");
    }
  }, [tab, hasPartialBlocks, setTab]);

  const close = useCallback(() => {
    pubsub.publish(CHAI_BUILDER_EVENTS.CLOSE_ADD_BLOCK);
  }, []);

  const canImportHTML = importHTMLSupport && hasPermission(PERMISSIONS.IMPORT_HTML);

  return (
    <div className={mergeClasses("flex h-full w-full flex-col overflow-hidden", className)}>
      {showHeading ? (
        <div className="mb-2 flex flex-col justify-between rounded-md bg-background/30 p-1">
          <h1 className="flex flex-col items-baseline px-1 text-xl font-semibold xl:flex-col">{t("Add block")}</h1>
          <span className="p-0 text-xs font-light leading-3 opacity-80 xl:pl-1">
            {tab === "html" ? t("Enter or paste TailwindCSS HTML snippet") : t("Click to add block to page")}
          </span>
        </div>
      ) : null}

      <Tabs
        onValueChange={(_tab) => {
          setCategory("");
          setTab(_tab);
        }}
        value={tab}
        className={"flex h-full max-h-full flex-col overflow-hidden"}>
        <TabsList className={"flex w-full items-center"}>
          <TabsTrigger value="library">{t("Library")}</TabsTrigger>
          <TabsTrigger value="core">{t("Blocks")}</TabsTrigger>
          {hasPartialBlocks && <TabsTrigger value="partials">{t("Partials")}</TabsTrigger>}
          {canImportHTML ? <TabsTrigger value="html">{t("Import")}</TabsTrigger> : null}
          {map(addBlocksDialogTabs, (tab) => (
            <TabsTrigger value={tab.key}>{React.createElement(tab.tab)}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="core" className="h-full max-h-full flex-1 pb-20">
          <div className="-mx-1.5 h-full max-h-full overflow-hidden">
            <div className="mt-2 h-full w-full">
              <DefaultChaiBlocks gridCols={"grid-cols-4"} parentId={parentId} position={position} />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="library" className="h-full max-h-full flex-1 pb-20">
          <UILibraries parentId={parentId} position={position} />
        </TabsContent>
        {hasPartialBlocks && (
          <TabsContent value="partials" className="h-full max-h-full flex-1 pb-20">
            <div className="-mx-1.5 h-full max-h-full overflow-hidden">
              <div className="mt-2 h-full w-full">
                <PartialBlocks gridCols={"grid-cols-4"} parentId={parentId} position={position} />
              </div>
            </div>
          </TabsContent>
        )}
        {canImportHTML ? (
          <TabsContent value="html" className="h-full max-h-full flex-1 pb-20">
            <ImportHTML parentId={parentId} position={position} />
          </TabsContent>
        ) : null}
        {map(addBlocksDialogTabs, (tab) => (
          <TabsContent value={tab.key}>
            {React.createElement(tab.tabContent, { close, parentId, position })}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AddBlocksPanel;

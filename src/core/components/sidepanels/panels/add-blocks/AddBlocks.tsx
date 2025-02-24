import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { capitalize, filter, find, map, reject, sortBy, values } from "lodash-es";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Input, ScrollArea, Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../ui";
import { showPredefinedBlockCategoryAtom } from "../../../../atoms/ui";
import { canAcceptChildBlock, canBeNestedInside } from "../../../../functions/block-helpers.ts";
import { useBlocksStore, useBuilderProp } from "../../../../hooks";
import { CHAI_BUILDER_EVENTS, mergeClasses, UILibraries } from "../../../../main";
import { pubsub } from "../../../../pubsub.ts";
import { CoreBlock } from "./CoreBlock";
import { DefaultChaiBlocks } from "./DefaultBlocks.tsx";
import ImportHTML from "./ImportHTML";

const CORE_GROUPS = ["basic", "typography", "media", "layout", "form", "advanced", "other"];

export const ChaiBuilderBlocks = ({ groups, blocks, parentId, position, gridCols = "grid-cols-4" }: any) => {
  const { t } = useTranslation();
  const [allBlocks] = useBlocksStore();
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [tab] = useAtom(addBlockTabAtom);
  const parentType = find(allBlocks, (block) => block._id === parentId)?._type;

  // Focus search input on mount and tab change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [tab]);

  const filteredBlocks = searchTerm
    ? values(blocks).filter((block: any) =>
        (block.label?.toLowerCase() + " " + block.type?.toLowerCase()).includes(searchTerm.toLowerCase()),
      )
    : blocks;

  const filteredGroups = searchTerm
    ? groups.filter((group: string) => reject(filter(values(filteredBlocks), { group }), { hidden: true }).length > 0)
    : groups.filter((group: string) => reject(filter(values(blocks), { group }), { hidden: true }).length > 0);

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col">
      {/* Search at top */}
      <div className="sticky top-0 z-10 bg-background/80 px-4 py-2 backdrop-blur-sm">
        <Input
          ref={searchInputRef}
          type="search"
          placeholder={t("Search blocks...")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ScrollArea className="h-full">
        {filteredGroups.length === 0 && searchTerm ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <p>
              {t("No blocks found matching")} "{searchTerm}"
            </p>
          </div>
        ) : (
          <div className="space-y-6 p-4">
            {sortBy(filteredGroups, (group: string) =>
              CORE_GROUPS.indexOf(group) === -1 ? 99 : CORE_GROUPS.indexOf(group),
            ).map((group) => (
              <div key={group} className="space-y-3">
                <h3 className="px-1 text-sm font-medium">{capitalize(t(group.toLowerCase()))}</h3>
                <div className={"grid gap-2 " + gridCols}>
                  {React.Children.toArray(
                    reject(filter(values(filteredBlocks), { group }), { hidden: true }).map((block) => (
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
  const close = useCallback(() => {
    pubsub.publish(CHAI_BUILDER_EVENTS.CLOSE_ADD_BLOCK);
  }, []);
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
          {importHTMLSupport ? <TabsTrigger value="html">{t("Import")}</TabsTrigger> : null}
          {map(addBlocksDialogTabs, (tab) => (
            <TabsTrigger value={tab.key}>{React.createElement(tab.tab)}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="core" className="h-full max-h-full flex-1 pb-20">
          <ScrollArea className="-mx-1.5 h-full max-h-full overflow-y-auto">
            <div className="mt-2 w-full">
              <DefaultChaiBlocks gridCols={"grid-cols-4"} parentId={parentId} position={position} />
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="library" className="h-full max-h-full flex-1 pb-20">
          <UILibraries parentId={parentId} position={position} />
        </TabsContent>
        {importHTMLSupport ? (
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

import React, { useCallback } from "react";
import { capitalize, filter, find, map, reject, sortBy, values } from "lodash-es";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollArea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../../ui";
import { CoreBlock } from "./CoreBlock";
import { showPredefinedBlockCategoryAtom } from "../../../../atoms/ui";
import { useBlocksStore, useBuilderProp } from "../../../../hooks";
import ImportHTML from "./ImportHTML";
import { CHAI_BUILDER_EVENTS, mergeClasses, UILibraries } from "../../../../main";
import { canAcceptChildBlock, canBeNestedInside } from "../../../../functions/block-helpers.ts";
import { DefaultChaiBlocks } from "./DefaultBlocks.tsx";
import { atomWithStorage } from "jotai/utils";
import { pubsub } from "../../../../pubsub.ts";

const CORE_GROUPS = ["basic", "typography", "media", "layout", "form", "advanced", "other"];

export const ChaiBuilderBlocks = ({ groups, blocks, parentId, position, gridCols = "grid-cols-4" }: any) => {
  const { t } = useTranslation();
  const [allBlocks] = useBlocksStore();
  const parentType = find(allBlocks, (block) => block._id === parentId)?._type;
  return React.Children.toArray(
    map(
      sortBy(groups, (group: string) => (CORE_GROUPS.indexOf(group) === -1 ? 99 : CORE_GROUPS.indexOf(group))),
      (group: string) =>
        reject(filter(values(blocks), { group }), { hidden: true }).length ? (
          <Accordion type="single" value={group} collapsible className="w-full">
            <AccordionItem value={group} className={"border-border"}>
              <AccordionTrigger className="rounded-md bg-background px-4 py-2 capitalize text-foreground hover:no-underline">
                {capitalize(t(group.toLowerCase()))}
              </AccordionTrigger>
              <AccordionContent className="mx-auto max-w-xl p-3">
                <div className={"grid gap-2 " + gridCols}>
                  {React.Children.toArray(
                    reject(filter(values(blocks), { group }), { hidden: true }).map((block) => {
                      return (
                        <CoreBlock
                          parentId={parentId}
                          position={position}
                          block={block}
                          disabled={
                            !canAcceptChildBlock(parentType, block.type) || !canBeNestedInside(parentType, block.type)
                          }
                        />
                      );
                    }),
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : null,
    ),
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
          <TabsContent value={tab.key}>{React.createElement(tab.tabContent, { close })}</TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AddBlocksPanel;

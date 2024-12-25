import React from "react";
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
  TabsList,
  TabsTrigger,
} from "../../../../../ui";
import { CoreBlock } from "./CoreBlock";
import { showPredefinedBlockCategoryAtom } from "../../../../atoms/ui";
import { useBlocksStore, useBuilderProp } from "../../../../hooks";
import ImportHTML from "./ImportHTML";
import { mergeClasses, UILibraries } from "../../../../main";
import { canAcceptChildBlock, canBeNestedInside } from "../../../../functions/block-helpers.ts";
import { DefaultChaiBlocks } from "./DefaultBlocks.tsx";
import { atomWithStorage } from "jotai/utils";

const CORE_GROUPS = ["basic", "typography", "media", "layout", "form", "advanced", "other"];

export const ChaiBuilderBlocks = ({ groups, blocks, parentId, gridCols = "grid-cols-4" }: any) => {
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
  tabs = ["library", "core", "html"],
}: {
  parentId?: string;
  showHeading?: boolean;
  className?: string;
  tabs?: string[];
}) => {
  const { t } = useTranslation();
  const [tab, setTab] = useAtom(addBlockTabAtom);
  const [, setCategory] = useAtom(showPredefinedBlockCategoryAtom);
  const importHTMLSupport = useBuilderProp("importHTMLSupport", true);
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
        className={mergeClasses("h-max")}>
        <TabsList className={"grid w-full " + (importHTMLSupport ? "grid-cols-3" : "grid-cols-2")}>
          <TabsTrigger value="library">{t("Library")}</TabsTrigger>
          <TabsTrigger value="core">{t("Blocks")}</TabsTrigger>
          {importHTMLSupport ? <TabsTrigger value="html">{t("Import")}</TabsTrigger> : null}
        </TabsList>
      </Tabs>
      {tabs.includes("core") && tab === "core" && (
        <ScrollArea className="-mx-1.5 h-[calc(100vh-156px)] overflow-y-auto">
          <div className="mt-2 w-full">
            <DefaultChaiBlocks gridCols={"grid-cols-4"} parentId={parentId} />
          </div>
        </ScrollArea>
      )}
      {tabs.includes("library") && tab === "library" && <UILibraries parentId={parentId} />}
      {tabs.includes("html") && tab === "html" && importHTMLSupport ? <ImportHTML parentId={parentId} /> : null}
    </div>
  );
};

export default AddBlocksPanel;

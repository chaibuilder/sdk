import React, { useEffect, useState } from "react";
import {
  capitalize,
  filter,
  find,
  first,
  groupBy,
  includes,
  isEmpty,
  map,
  reject,
  sortBy,
  uniq,
  values,
} from "lodash-es";
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
import { useChaiBlocks } from "@chaibuilder/runtime";
import { mergeClasses, UILibraries } from "../../../../main";
import { useAddBlocksModal } from "../../../../hooks/useAddBlocks.ts";
import { canAcceptChildBlock, canBeNestedInside } from "../../../../functions/block-helpers.ts";

const CORE_GROUPS = ["basic", "typography", "media", "layout", "form", "advanced", "other"];

export const ChaiBuilderBlocks = ({ groups, blocks }: any) => {
  const { t } = useTranslation();
  const [allBlocks] = useBlocksStore();
  const [parentId] = useAddBlocksModal();
  const parentType = find(allBlocks, (block) => block._id === parentId)?._type;
  return React.Children.toArray(
    map(
      sortBy(groups, (group: string) => (CORE_GROUPS.indexOf(group) === -1 ? 99 : CORE_GROUPS.indexOf(group))),
      (group: string) =>
        reject(filter(values(blocks), { group }), { hidden: true }).length ? (
          <Accordion type="single" value={group} collapsible className="w-full">
            <AccordionItem value={group}>
              <AccordionTrigger className="rounded-md bg-gray-100 px-4 py-2 capitalize hover:no-underline">
                {capitalize(t(group.toLowerCase()))}
              </AccordionTrigger>
              <AccordionContent className="mx-auto max-w-xl p-3">
                <div className="grid grid-cols-4 gap-2">
                  {React.Children.toArray(
                    reject(filter(values(blocks), { group }), { hidden: true }).map((block) => {
                      return (
                        <CoreBlock
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

const AddBlocksPanel = ({ className, showHeading = true }: { showHeading?: boolean; className?: string }) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<string>("library");
  const [active, setActive] = useState<string>("basic");
  const allChaiBlocks = useChaiBlocks();
  const [, setCategory] = useAtom(showPredefinedBlockCategoryAtom);
  const importHTMLSupport = useBuilderProp("importHTMLSupport", true);
  const filterChaiBlock = useBuilderProp("filterChaiBlock", () => true);
  const chaiBlocks = filter(allChaiBlocks, filterChaiBlock);

  const groupedBlocks = groupBy(chaiBlocks, "category") as Record<string, any[]>;
  const uniqueTypeGroup = uniq(map(groupedBlocks.core, "group"));

  // * setting active tab if not already selected from current unique list
  useEffect(() => {
    if (!includes(uniqueTypeGroup, active) && !isEmpty(uniqueTypeGroup) && !isEmpty(active)) {
      setActive(first(uniqueTypeGroup) as string);
    }
  }, [uniqueTypeGroup, active]);

  return (
    <div className={mergeClasses("flex h-full w-full flex-col overflow-hidden", className)}>
      {showHeading ? (
        <div className="mb-2 flex flex-col justify-between rounded-md bg-background/30 p-1">
          <h1 className="flex flex-col items-baseline px-1 text-xl font-semibold xl:flex-col">{t("add_block")}</h1>
          <span className="p-0 text-xs font-light leading-3 opacity-80 xl:pl-1">
            {tab === "html" ? t("enter_paste_tailwind_html") : t("click_to_add_block")}
          </span>
        </div>
      ) : null}

      <Tabs
        onValueChange={(_tab) => {
          setCategory("");
          setTab(_tab);
        }}
        value={tab}
        className={mergeClasses("h-max", !importHTMLSupport ? "hidden" : "")}>
        <TabsList className={"grid w-full " + (importHTMLSupport ? "grid-cols-3" : "grid-cols-1")}>
          <TabsTrigger value="library">{t("library")}</TabsTrigger>
          <TabsTrigger value="core">{t("blocks")}</TabsTrigger>

          {importHTMLSupport ? <TabsTrigger value="html">{t("import")}</TabsTrigger> : null}
        </TabsList>
      </Tabs>
      {tab === "core" && (
        <ScrollArea className="-mx-1.5 h-[calc(100vh-156px)] overflow-y-auto">
          <div className="mt-2 w-full">
            <ChaiBuilderBlocks groups={uniqueTypeGroup} blocks={groupedBlocks.core} />
          </div>
        </ScrollArea>
      )}
      {tab === "library" && <UILibraries />}
      {tab === "html" && importHTMLSupport ? <ImportHTML /> : null}
    </div>
  );
};

export default AddBlocksPanel;

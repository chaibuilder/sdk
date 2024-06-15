import React, { Suspense, useEffect, useState } from "react";
import { filter, find, first, groupBy, includes, isEmpty, map, reject, uniq, values } from "lodash-es";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollArea,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
} from "../../../../../ui";
import { CoreBlock } from "./CoreBlock";
import { PredefinedBlocks } from "./PredefinedBlocks";
import { showPredefinedBlockCategoryAtom } from "../../../../atoms/ui";
import { useBuilderProp, useUILibraryBlocks } from "../../../../hooks";
import ImportHTML from "./ImportHTML";
import { useChaiBlocks } from "@chaibuilder/runtime";

/**
 *
 * Checking which block to show in add block list
 *
 */
const isAllowedBlockType = () => {
  return true;
};

const AddBlocksPanel = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<string>("core");
  const [active, setActive] = useState<string>("basic");
  const chaiBlocks = useChaiBlocks();
  const [, setCategory] = useAtom(showPredefinedBlockCategoryAtom);
  const importHTMLSupport = useBuilderProp("importHTMLSupport", true);

  const { data: predefinedBlocks, isLoading } = useUILibraryBlocks();
  const groupedBlocks = groupBy(
    filter(chaiBlocks, () => isAllowedBlockType()),
    "category",
  ) as { core: any[]; custom: any[] };

  const uniqueTypeGroup = uniq(map(groupedBlocks.core, "group"));

  // * setting active tab if not already selected from current unique list
  useEffect(() => {
    if (!includes(uniqueTypeGroup, active) && !isEmpty(uniqueTypeGroup) && !isEmpty(active)) {
      setActive(first(uniqueTypeGroup) as string);
    }
  }, [uniqueTypeGroup, active]);

  const hasUiBlocks =
    (!isLoading && !isEmpty(predefinedBlocks)) || find(values(chaiBlocks), { category: "custom" }) !== undefined;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="mb-2 flex flex-col justify-between rounded-md bg-background/30 p-1">
        <h1 className="flex flex-col items-baseline px-1 text-xl font-semibold xl:flex-col">{t("add_block")}</h1>
        <span className="p-0 text-xs font-light leading-3 opacity-80 xl:pl-1">
          {tab === "html" ? t("enter_paste_tailwind_html") : t("click_to_add_block")}
        </span>
      </div>

      <Tabs
        onValueChange={(_tab) => {
          setCategory("");
          setTab(_tab);
        }}
        value={tab}
        className="h-max">
        <TabsList
          className={
            "grid w-full " +
            (hasUiBlocks && importHTMLSupport
              ? "grid-cols-3"
              : (hasUiBlocks && !importHTMLSupport) || (!hasUiBlocks && importHTMLSupport)
                ? "grid-cols-2"
                : "grid-cols-1")
          }>
          <TabsTrigger value="core">{t("Blocks")}</TabsTrigger>
          {hasUiBlocks ? <TabsTrigger value="ui-blocks">{t("ui_library")}</TabsTrigger> : null}
          {importHTMLSupport ? <TabsTrigger value="html">{t("import")}</TabsTrigger> : null}
        </TabsList>
      </Tabs>
      {tab === "core" && (
        <ScrollArea className="-mx-1.5 h-full">
          <div className="mt-2 w-full">
            {React.Children.toArray(
              map(uniqueTypeGroup, (group: string) =>
                reject(filter(values(groupedBlocks.core), { group }), {
                  hidden: true,
                }).length ? (
                  <Accordion type="single" value={group} collapsible className="w-full">
                    <AccordionItem value={group}>
                      <AccordionTrigger className="rounded-md bg-gray-100 px-4 py-2 capitalize">
                        {group}
                      </AccordionTrigger>
                      <AccordionContent className="p-3">
                        <div className="grid grid-cols-3 gap-2">
                          {React.Children.toArray(
                            reject(filter(values(groupedBlocks.core), { group }), { hidden: true }).map((block) => (
                              <CoreBlock block={block} />
                            )),
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ) : null,
              ),
            )}
          </div>
        </ScrollArea>
      )}
      {tab === "ui-blocks" && (
        <Suspense fallback={<Skeleton className="h-32 w-full" />}>
          <PredefinedBlocks />
        </Suspense>
      )}
      {tab === "html" && importHTMLSupport ? <ImportHTML /> : null}
    </div>
  );
};

export default AddBlocksPanel;

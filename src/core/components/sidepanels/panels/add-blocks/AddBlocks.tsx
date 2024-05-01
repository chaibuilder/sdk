import React, { Suspense, useEffect, useState } from "react";
import { filter, find, first, groupBy, includes, isEmpty, map, reject, uniq, values } from "lodash";
import { useAtom } from "jotai";
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
import { ChaiBlock } from "../../../../types/ChaiBlock";
import { useAllBlocks, useSelectedBlockIds, useUILibraryBlocks } from "../../../../hooks";
import ImportHTML from "./ImportHTML";
import { useChaiBlocks } from "@chaibuilder/runtime";

/**
 *
 * Checking which block to show in add block list
 *
 */
const notAllowedInRoot = ["ListItem", "TableHead", "TableBody", "TableRow", "TableCell", "Column"];
const isAllowedBlockType = (block: ChaiBlock | null | undefined, type: string) => {
  if (!block) return !includes(notAllowedInRoot, type);

  const parentType = block._type;
  if (parentType === "List") return type === "ListItem";
  else if (parentType === "Table") return type === "TableHead" || type === "TableBody";
  else if (parentType === "TableHead" || parentType === "TableBody") return type === "TableRow";
  else if (parentType === "TableRow") return type === "TableCell";
  else if (parentType === "Row") return type === "Column";
  return !includes(notAllowedInRoot, type);
};

const AddBlocksPanel = () => {
  const [tab, setTab] = useState<string>("core");
  const [active, setActive] = useState<string>("basic");
  const chaiBlocks = useChaiBlocks();
  const [, setCategory] = useAtom(showPredefinedBlockCategoryAtom);

  const [ids] = useSelectedBlockIds();
  const blocks = useAllBlocks();
  const block = find(blocks, { _id: first(ids) });

  const { data: predefinedBlocks, isLoading } = useUILibraryBlocks();
  const groupedBlocks = groupBy(
    filter(chaiBlocks, (cBlock: any) => isAllowedBlockType(block, cBlock.type)),
    "category",
  ) as { core: any[]; custom: any[] };

  const uniqueTypeGroup = uniq(map(groupedBlocks.core, "group"));

  // * setting active tab if not already selected from current unique list
  useEffect(() => {
    if (!includes(uniqueTypeGroup, active) && !isEmpty(uniqueTypeGroup) && !isEmpty(active)) {
      setActive(first(uniqueTypeGroup) as string);
    }
  }, [uniqueTypeGroup, active]);

  const onToggle = (value: string) => setActive((oldValue) => (oldValue === value ? "" : value));
  const hasUiBlocks =
    (!isLoading && !isEmpty(predefinedBlocks)) || find(values(chaiBlocks), { category: "custom" }) !== undefined;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="mb-2 flex flex-col justify-between rounded-md bg-background/30 p-1">
        <h1 className="flex flex-col items-baseline px-1 text-xl font-semibold xl:flex-col">Add block</h1>
        <span className="p-0 text-xs font-light leading-3 opacity-80 xl:pl-1">
          {tab === "html" ? "(Enter or paste your own HTML code)" : "(Click to add block to page)"}
        </span>
      </div>

      <Tabs
        onValueChange={(_tab) => {
          setCategory("");
          setTab(_tab);
        }}
        value={tab}
        className="h-max">
        <TabsList className={"grid w-full " + (hasUiBlocks ? "grid-cols-3" : "grid-cols-2")}>
          <TabsTrigger value="core">Core</TabsTrigger>
          {hasUiBlocks ? <TabsTrigger value="ui-blocks">UI Blocks</TabsTrigger> : null}
          <TabsTrigger value="html">Import</TabsTrigger>
        </TabsList>
      </Tabs>
      {tab === "core" && (
        <ScrollArea className="-mx-1.5 h-full">
          <Accordion type="single" value={active} className="w-full px-3">
            {React.Children.toArray(
              map(uniqueTypeGroup, (group) =>
                reject(filter(values(groupedBlocks.core), { group }), {
                  hidden: true,
                }).length ? (
                  <AccordionItem value={group} className="border-border">
                    <AccordionTrigger onClick={() => onToggle(group)} className="py-2 capitalize">
                      {group}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-3 gap-2">
                        {React.Children.toArray(
                          reject(filter(values(groupedBlocks.core), { group }), { hidden: true }).map((block) => (
                            <CoreBlock block={block} />
                          )),
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ) : null,
              ),
            )}
          </Accordion>
        </ScrollArea>
      )}
      {tab === "ui-blocks" && (
        <Suspense fallback={<Skeleton className="h-32 w-full" />}>
          <PredefinedBlocks />
        </Suspense>
      )}
      {tab === "html" && <ImportHTML />}
    </div>
  );
};

export default AddBlocksPanel;

import { Component2Icon, Half2Icon, PlusIcon } from "@radix-ui/react-icons";
import React, { lazy, LazyExoticComponent, Suspense, useState } from "react";
import { useAtom } from "jotai";
import { each, get, isEmpty, find, values, filter } from "lodash-es";
import { Button, Skeleton, Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui";
import { activePanelAtom } from "../../atoms/ui";
import { useBuilderProp, useUILibraryBlocks } from "../../hooks";
import { DatabaseIcon, ListTreeIcon } from "lucide-react";
import { PageDataProviders } from "./PageDataProviders.tsx";
import { useTranslation } from "react-i18next";
import { OUTLINE_KEY } from "../../constants/STRINGS.ts";
import { HotKeys } from "../HotKeys.tsx";
import { cn } from "../../functions/Functions.ts";
import { useChaiBlocks } from "@chaibuilder/runtime";

const AddBlocksPanel = lazy(() => import("./panels/add-blocks/AddBlocks.tsx"));
const ArboristPanel = lazy(() => import("./panels/outline/treeview/ListTree.tsx"));
const BrandingOptions = lazy(() => import("./panels/branding/BrandingOptions"));
const ImagesPanel = lazy(() => import("./panels/images/ImagesPanel"));
const PanelPredefinedBlocks = lazy(() => import("./panels/add-blocks/PanelPredefinedBlocks.tsx"));

let timeout: any = null;

const SidePanels = () => {
  const topComponents: {
    icon: React.FC<any>;
    name: string;
    panel: LazyExoticComponent<any>;
  }[] = useBuilderProp("sideBarComponents.top", []);
  const bottomComponents: LazyExoticComponent<any>[] = useBuilderProp("sideBarComponents.bottom", []);
  const [activePanel, setActivePanel] = useAtom(activePanelAtom);
  const [_activePanel, _setActivePanel] = useState(activePanel);
  const [hideTimeout, setHideTimeout] = useState<any>(null);
  const { t } = useTranslation();

  const allChaiBlocks = useChaiBlocks();
  const filterChaiBlock = useBuilderProp("filterChaiBlock", () => true);
  const chaiBlocks = filter(allChaiBlocks, filterChaiBlock);

  const { data: predefinedBlocks, isLoading } = useUILibraryBlocks();

  const hasUiBlocks =
    (!isLoading && !isEmpty(predefinedBlocks)) || find(values(chaiBlocks), { category: "custom" }) !== undefined;

  const panels: { [key: string]: React.ComponentType<any> } = {
    "add-blocks": AddBlocksPanel,
    [OUTLINE_KEY]: ArboristPanel,
    "branding-options": BrandingOptions,
    images: ImagesPanel,
    "ui-library": PanelPredefinedBlocks,
  };
  each(topComponents, ({ name, panel }) => {
    panels[name] = panel;
  });

  const handleChangePanel = (newPanel: string) => {
    // * Waiting for panel to slide in before changing its content
    clearTimeout(timeout);
    if (activePanel !== OUTLINE_KEY && newPanel === OUTLINE_KEY) {
      timeout = setTimeout(() => setActivePanel(OUTLINE_KEY), 500);
    } else {
      _setActivePanel(newPanel);
    }
    setActivePanel(newPanel);
  };
  const dataBindingSupport = useBuilderProp("dataBindingSupport", false);

  function hidePanel() {
    const timeout = setTimeout(() => {
      if (hideTimeout) {
        handleChangePanel(OUTLINE_KEY);
        clearTimeout(hideTimeout);
      }
    }, 500);
    setHideTimeout(timeout);
  }

  return (
    <div className="relative flex">
      {activePanel !== OUTLINE_KEY ? (
        <div
          onMouseEnter={hidePanel}
          onClick={() => handleChangePanel(OUTLINE_KEY)}
          className={"fixed inset-0 z-[50] bg-black/20"}></div>
      ) : null}
      <div className="z-[100] flex h-full w-fit flex-col items-center justify-between border-b border-r border-border bg-background pt-2">
        <div className="relative z-[100] flex w-14 flex-col items-center space-y-2">
          {hasUiBlocks ? (
            <Button
              onClick={() => {
                handleChangePanel("add-blocks");
              }}
              size="sm"
              variant={activePanel === "add-blocks" ? "default" : "outline"}>
              <PlusIcon className="text-xl" />
            </Button>
          ) : (
            <div className="flex flex-col gap-1 rounded-md border bg-zinc-500 p-1">
              <Button
                onClick={() => {
                  handleChangePanel("add-blocks");
                }}
                size="sm"
                variant={activePanel === "add-blocks" ? "default" : "outline"}>
                <PlusIcon className="text-xl" />
              </Button>
              <Button
                onClick={() => handleChangePanel("ui-library")}
                size="sm"
                variant={activePanel === "ui-library" ? "default" : "outline"}>
                <Component2Icon className="text-xl" />
              </Button>
            </div>
          )}
          <Button
            onClick={() => handleChangePanel(OUTLINE_KEY)}
            size="sm"
            variant={activePanel === OUTLINE_KEY ? "default" : "outline"}>
            <ListTreeIcon className="w-4" />
          </Button>
          <Button
            onClick={() => handleChangePanel("branding-options")}
            size="sm"
            variant={activePanel === "branding-options" ? "default" : "outline"}>
            <Half2Icon className="w-4 max-w-[40px] text-xs" />
          </Button>

          {React.Children.toArray(
            topComponents.map(({ name, icon: PanelIcon }) => (
              <Suspense fallback={<Skeleton className="h-10" />}>
                <Button
                  onClick={() => handleChangePanel(name)}
                  size="sm"
                  className="w-10"
                  variant={activePanel === name ? "default" : "outline"}>
                  <PanelIcon />
                </Button>
              </Suspense>
            )),
          )}
        </div>
        <div className="relative z-[100] flex w-14 flex-col items-center space-y-2 pb-2">
          <HotKeys />
          {React.Children.toArray(
            bottomComponents.map((Component) => (
              <Suspense fallback={<Skeleton className="h-10" />}>
                <Component />
              </Suspense>
            )),
          )}
        </div>
      </div>
      {activePanel !== OUTLINE_KEY ? (
        <div
          className={
            "absolute left-14 z-[50] h-full w-fit translate-x-0 border-r bg-background transition-all duration-500 ease-in-out"
          }>
          <Suspense
            fallback={
              <div className="flex animate-pulse flex-col gap-y-2 bg-white p-4">
                <div className="h-6 w-1/2 bg-gray-300" />
                <div className="h-16 w-full bg-gray-200" />
                <div className="h-16 w-full bg-gray-200" />
              </div>
            }>
            <div
              className={cn("relative z-[100] h-full max-h-full overflow-y-auto overflow-x-hidden bg-background p-1")}
              onMouseEnter={() => {
                if (hideTimeout) clearTimeout(hideTimeout);
              }}>
              {React.createElement(get(panels, activePanel, () => <div />))}
            </div>
          </Suspense>
        </div>
      ) : null}
      <div className="h-full w-60 border-r p-1">
        <Suspense
          fallback={
            <div className="flex animate-pulse flex-col gap-y-2 p-4">
              <div className="h-6 w-1/2 bg-gray-300" />
              <div className="h-16 w-full bg-gray-200" />
              <div className="h-16 w-full bg-gray-200" />
            </div>
          }>
          {dataBindingSupport ? (
            <Tabs defaultValue={OUTLINE_KEY} className="flex h-full w-full flex-col py-1">
              <TabsList className="mx-1 grid h-10 grid-cols-2">
                <TabsTrigger value={OUTLINE_KEY}>
                  <ListTreeIcon className={"mr-2 h-3"} /> {t("Outline")}
                </TabsTrigger>
                <TabsTrigger value="data-provider">
                  <DatabaseIcon className={"mr-2 w-3"} />
                  {t("Data")}
                </TabsTrigger>
              </TabsList>
              <TabsContent value={OUTLINE_KEY} className="no-scrollbar h-full flex-1 overflow-y-auto overflow-x-hidden">
                {React.createElement(ArboristPanel)}
              </TabsContent>
              <TabsContent value="data-provider" className="flex-1 overflow-y-auto overflow-x-hidden">
                <PageDataProviders />
              </TabsContent>
            </Tabs>
          ) : (
            <>
              <Tabs defaultValue={OUTLINE_KEY} className="flex h-full w-full flex-col py-1">
                <TabsList className="mx-1 grid h-10 grid-cols-1">
                  <TabsTrigger value={OUTLINE_KEY}>
                    <ListTreeIcon className={"mr-2 h-3"} /> {t("Outline")}
                  </TabsTrigger>
                </TabsList>
                <TabsContent
                  value={OUTLINE_KEY}
                  className="no-scrollbar h-full flex-1 overflow-y-auto overflow-x-hidden">
                  {React.createElement(ArboristPanel)}
                </TabsContent>
              </Tabs>
            </>
          )}
        </Suspense>
      </div>
    </div>
  );
};

export default SidePanels;

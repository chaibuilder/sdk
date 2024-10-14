import React, { ComponentType, lazy, MouseEvent, Suspense, useMemo, useState } from "react";
import { isDevelopment } from "../../import-html/general.ts";
import { useBuilderProp, useLayoutVariant } from "../../hooks";
import "../canvas/static/BlocksExternalDataProvider.tsx";
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../ui";
import { motion } from "framer-motion";
import { EditIcon, Layers, LayoutTemplate, PaintBucketIcon } from "lucide-react";
import { Outline, ThemeOptions } from "../../main";
import { CanvasTopBar } from "../canvas/topbar/CanvasTopBar.tsx";
import CanvasArea from "../canvas/CanvasArea.tsx";
import { AddBlocksDialog } from "./AddBlocksDialog.tsx";
import { useTranslation } from "react-i18next";
import { GearIcon, LightningBoltIcon } from "@radix-ui/react-icons";
import SettingsPanel from "../settings/SettingsPanel.tsx";
import { AskAI } from "../AskAi.tsx";
import { CHAI_BUILDER_EVENTS, useChaiBuilderMsgListener } from "../../events.ts";
import { ChooseLayout } from "./ChooseLayout.tsx";
import { compact, get } from "lodash-es";
import { HotKeys } from "../HotKeys.tsx";
import { PageDataProviders } from "../sidepanels/PageDataProviders.tsx";
import { AiFillDatabase } from "react-icons/ai";

const TopBar = lazy(() => import("../topbar/Topbar.tsx"));

function useSidebarMenuItems(layoutVariant: string) {
  const singleSidePanel = layoutVariant === "SINGLE_SIDE_PANEL";
  const { t } = useTranslation();
  const dataBindingSupport = useBuilderProp("dataBindingSupport", false);
  const askAICallback = useBuilderProp("askAiCallBack", null);
  return useMemo(() => {
    const items = [
      {
        icon: <Layers size={20} />,
        label: "sidebar.outline",
        component: () => (
          <div className="-mt-8">
            <Outline />
          </div>
        ),
      },
      singleSidePanel
        ? { icon: <GearIcon className="size-5" />, label: "sidebar.edit_block", component: SettingsPanel }
        : null,
      dataBindingSupport
        ? { icon: <AiFillDatabase className="size-3" />, label: t("Data Providers"), component: PageDataProviders }
        : null,
      askAICallback
        ? { icon: <LightningBoltIcon className="size-5" />, label: "sidebar.ai_assistant", component: AskAI }
        : null,
      {
        icon: <PaintBucketIcon size={20} />,
        label: "sidebar.theme",
        component: () => <ThemeOptions showHeading={false} />,
      },
    ];
    return compact(items);
  }, [singleSidePanel, dataBindingSupport, t, askAICallback]);
}

function isDualLayout(layoutVariant: string) {
  return layoutVariant !== "SINGLE_SIDE_PANEL";
}

/**
 * RootLayout is a React component that renders the main layout of the application.
 */
const RootLayout: ComponentType = () => {
  const [activePanelIndex, setActivePanelIndex] = useState(0);
  const [layoutVariant] = useLayoutVariant();
  const [chooseLayout, setChooseLayout] = useState(false);
  useChaiBuilderMsgListener(({ name }) => {
    if (name === CHAI_BUILDER_EVENTS.SHOW_BLOCK_SETTINGS) {
      setActivePanelIndex(1);
    }
  });
  const topComponents = useBuilderProp("sideBarComponents.top", []);
  /**
   * Prevents the context menu from appearing in production mode.
   * @param {MouseEvent<HTMLDivElement>} e - The mouse event.
   */
  const preventContextMenu = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDevelopment()) e.preventDefault();
  };

  const handleMenuItemClick = (index: number) => {
    setActivePanelIndex(activePanelIndex === index ? null : index);
  };

  const menuItems = useSidebarMenuItems(layoutVariant);

  const { t } = useTranslation();
  const sidebarMenuItems = [...menuItems, ...topComponents];
  const htmlDir = useBuilderProp("htmlDir", "ltr");
  return (
    <div dir={htmlDir} className="h-screen max-h-full w-screen overflow-x-hidden bg-background text-foreground">
      <TooltipProvider>
        <div
          onContextMenu={preventContextMenu}
          className="flex h-screen max-h-full flex-col bg-background text-foreground">
          <div className="h-14 w-screen shrink-0 border-b border-border">
            <Suspense>
              <TopBar />
            </Suspense>
          </div>
          <main className="relative flex h-[calc(100vh-56px)] max-w-full flex-1 flex-row">
            <div className="flex w-12 flex-col items-center justify-between border-r border-border py-2">
              <div className="flex flex-col">
                {sidebarMenuItems.map((item, index) => (
                  <Tooltip key={"button" + index}>
                    <TooltipTrigger asChild>
                      <Button
                        key={index}
                        variant={activePanelIndex === index ? "default" : "ghost"}
                        className={`mb-2 rounded-lg p-2 transition-colors`}
                        onClick={() => handleMenuItemClick(index)}>
                        {get(item, "icon", null)}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side={"right"}>
                      <p>{t(item.label)}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
              <div className="flex flex-col space-y-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" onClick={() => setChooseLayout(true)}>
                      <LayoutTemplate size={20} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side={"right"}>
                    <p>{t("Choose Builder Layout")}</p>
                  </TooltipContent>
                </Tooltip>
                <HotKeys />
              </div>
            </div>
            {/* Side Panel */}
            <motion.div
              className="h-full max-h-full border-r border-border"
              initial={{ width: 280 }}
              animate={{ width: activePanelIndex !== null ? 280 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}>
              {activePanelIndex !== null && (
                <div className="no-scrollbar overflow h-full overflow-x-hidden">
                  <div className="flex flex-col p-3">
                    <h2 className="-mt-1 flex h-10 items-center space-x-1 text-base font-bold">
                      <span className="rtl:ml-2 rtl:inline-block">
                        {get(sidebarMenuItems, `${activePanelIndex}.icon`, null)}
                      </span>
                      <span>{t(sidebarMenuItems[activePanelIndex].label)}</span>
                    </h2>
                    <div className="flex-1">
                      <Suspense fallback={<div>Loading...</div>}>
                        {React.createElement(get(sidebarMenuItems, `${activePanelIndex}.component`, null), {})}
                      </Suspense>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
            <div className="flex h-full max-h-full flex-1 flex-col bg-slate-800/20">
              <CanvasTopBar />
              <Suspense>
                <CanvasArea />
              </Suspense>
            </div>
            {isDualLayout(layoutVariant) ? (
              <motion.div
                className="h-full max-h-full border-l border-border"
                initial={{ width: 280 }}
                animate={{ width: 280 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}>
                <div className="no-scrollbar overflow h-full max-h-full overflow-x-hidden">
                  <div className="flex max-h-full flex-col p-3">
                    <h2 className="-mt-1 flex h-10 items-center space-x-1 text-base font-bold">
                      <EditIcon size={"16"} className="rtl:ml-2" />
                      <span>{t("Block Settings")}</span>
                    </h2>
                    <div className="flex-1">
                      <Suspense fallback={<div>Loading...</div>}>
                        <SettingsPanel />
                      </Suspense>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </main>
        </div>
        <AddBlocksDialog />
        <ChooseLayout open={chooseLayout} close={() => setChooseLayout(false)} />
      </TooltipProvider>
    </div>
  );
};

export { RootLayout };

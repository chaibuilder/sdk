import React, { ComponentType, lazy, MouseEvent, Suspense, useMemo, useState } from "react";
import { isDevelopment } from "../../import-html/general.ts";
import { useKeyEventWatcher } from "../../hooks/useKeyEventWatcher.ts";
import { useExpandTree } from "../../hooks/useExpandTree.ts";
import { useAtom } from "jotai";
import { useBuilderProp, useLayoutVariant, useSavePage } from "../../hooks";
import "../canvas/static/BlocksExternalDataProvider.tsx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../ui";
import { useIntervalEffect } from "@react-hookz/web";
import { selectedLibraryAtom } from "../../atoms/ui.ts";
import { motion } from "framer-motion";
import { EditIcon, Layers, LayoutTemplate, PaintBucketIcon } from "lucide-react";
import { Outline, ThemeOptions } from "../../main";
import { CanvasTopBar } from "../canvas/topbar/CanvasTopBar.tsx";
import CanvasArea from "../canvas/CanvasArea.tsx";
import { AddBlocksDialog } from "./AddBlocksDialog.tsx";
import { useTranslation } from "react-i18next";
import { LightningBoltIcon } from "@radix-ui/react-icons";
import SettingsPanel from "../settings/SettingsPanel.tsx";
import { AskAI } from "../AskAi.tsx";
import { CHAI_BUILDER_EVENTS, useChaiBuilderMsgListener } from "../../events.ts";
import { ChooseLayout } from "./ChooseLayout.tsx";
import { compact } from "lodash-es";
import { LAYOUT_VARIANTS } from "../../constants/LAYOUT_VARIANTS.ts";

const TopBar = lazy(() => import("../topbar/Topbar.tsx"));

const useAutoSave = () => {
  const { savePage } = useSavePage();
  const autoSaveSupported = useBuilderProp("autoSaveSupport", true);
  const autoSaveInterval = useBuilderProp("autoSaveInterval", 60);
  useIntervalEffect(() => {
    if (!autoSaveSupported) return;
    savePage();
  }, autoSaveInterval * 1000);
};

function useSidebarMenuItems(layoutVariant: string) {
  const singleSidePanel = layoutVariant === LAYOUT_VARIANTS.SINGLE_SIDE_PANEL;
  return useMemo(() => {
    const items = [
      { icon: <Layers size={20} />, label: "sidebar.outline", component: Outline },
      singleSidePanel ? { icon: <EditIcon size={16} />, label: "sidebar.edit_block", component: SettingsPanel } : null,
      { icon: <LightningBoltIcon className="size-5" />, label: "sidebar.ai_assistant", component: AskAI },
      {
        icon: <PaintBucketIcon size={20} />,
        label: "sidebar.theme",
        component: () => <ThemeOptions showHeading={false} />,
      },
    ];
    return compact(items);
  }, [layoutVariant]);
}

function isDualLayout(layoutVariant: string) {
  return layoutVariant !== LAYOUT_VARIANTS.SINGLE_SIDE_PANEL;
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

  useAtom(selectedLibraryAtom);
  useKeyEventWatcher();
  useExpandTree();
  useAutoSave();

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
            <div className="flex w-12 flex-col items-center justify-between border-r py-2">
              <div className="flex flex-col">
                {sidebarMenuItems.map((item, index) => (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        key={index}
                        className={`mb-2 rounded-lg p-2 text-gray-500 transition-colors ${
                          activePanelIndex === index ? "bg-primary text-white" : "hover:bg-primary hover:text-white"
                        }`}
                        onClick={() => handleMenuItemClick(index)}>
                        {item.icon}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side={"right"}>
                      <p>{t(item.label)}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
              <div className="flex flex-col">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setChooseLayout(true)}
                      className={`mb-2 rounded-lg p-2 text-gray-500 transition-colors hover:bg-primary hover:text-white`}>
                      <LayoutTemplate size={20} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side={"right"}>
                    <p>{t("Choose Builder Layout")}</p>
                  </TooltipContent>
                </Tooltip>
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
                      {sidebarMenuItems[activePanelIndex].icon}
                      <span>{t(sidebarMenuItems[activePanelIndex].label)}</span>
                    </h2>
                    <div className="flex-1">
                      <Suspense fallback={<div>Loading...</div>}>
                        {React.createElement(sidebarMenuItems[activePanelIndex].component, {})}
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
                      <EditIcon size={"16"} />
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

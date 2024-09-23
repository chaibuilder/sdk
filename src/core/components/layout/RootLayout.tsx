import React, { ComponentType, lazy, MouseEvent, Suspense, useState } from "react";
import { isDevelopment } from "../../import-html/general.ts";
import { useKeyEventWatcher } from "../../hooks/useKeyEventWatcher.ts";
import { useExpandTree } from "../../hooks/useExpandTree.ts";
import { useAtom } from "jotai";
import { useBuilderProp, useSavePage } from "../../hooks";
import "../canvas/static/BlocksExternalDataProvider.tsx";
import { TooltipProvider } from "../../../ui";
import { useIntervalEffect } from "@react-hookz/web";
import { selectedLibraryAtom } from "../../atoms/ui.ts";
import { motion } from "framer-motion";
import { EditIcon, Layers, PaintBucketIcon } from "lucide-react";
import { Outline, ThemeOptions } from "../../main";
import { CanvasTopBar } from "../canvas/topbar/CanvasTopBar.tsx";
import CanvasArea from "../canvas/CanvasArea.tsx";
import { AddBlocksDialog } from "./AddBlocksDialog.tsx";
import { useTranslation } from "react-i18next";
import { LightningBoltIcon } from "@radix-ui/react-icons";
import SettingsPanel from "../settings/SettingsPanel.tsx";
import { AskAI } from "../AskAi.tsx";
import { CHAI_BUILDER_EVENTS, useChaiBuilderMsgListener } from "../../events.ts";

const TopBar = lazy(() => import("../topbar/Topbar.tsx"));

const menuItems = [
  { icon: <Layers size={20} />, label: "sidebar.outline", component: Outline },
  { icon: <EditIcon size={16} />, label: "sidebar.edit_block", component: SettingsPanel },
  { icon: <LightningBoltIcon className="size-5" />, label: "sidebar.ai_assistant", component: AskAI },
  {
    icon: <PaintBucketIcon size={20} />,
    label: "sidebar.theme",
    component: () => <ThemeOptions showHeading={false} />,
  },
];

const useAutoSave = () => {
  const { savePage } = useSavePage();
  const autoSaveSupported = useBuilderProp("autoSaveSupport", true);
  const autoSaveInterval = useBuilderProp("autoSaveInterval", 60);
  useIntervalEffect(() => {
    if (!autoSaveSupported) return;
    savePage();
  }, autoSaveInterval * 1000);
};

/**
 * RootLayout is a React component that renders the main layout of the application.
 */
const RootLayout: ComponentType = () => {
  const [activePanelIndex, setActivePanelIndex] = useState(0);
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

  const { t } = useTranslation();
  const sidebarMenuItems = [...menuItems, ...topComponents];
  return (
    <div className="h-screen w-screen bg-background text-foreground">
      <TooltipProvider>
        <div
          onContextMenu={preventContextMenu}
          className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
          <div className="h-14 w-screen shrink-0 border-b border-border">
            <Suspense>
              <TopBar />
            </Suspense>
          </div>
          <main className="relative flex h-full flex-1 flex-row">
            <div className="flex w-12 flex-col items-center border-r py-2">
              {sidebarMenuItems.map((item, index) => (
                <button
                  key={index}
                  className={`mb-2 rounded-lg p-2 text-gray-500 transition-colors ${
                    activePanelIndex === index ? "bg-primary text-white" : "hover:bg-primary hover:text-white"
                  }`}
                  onClick={() => handleMenuItemClick(index)}>
                  {item.icon}
                </button>
              ))}
            </div>
            {/* Side Panel */}
            <motion.div
              className="h-full max-h-full overflow-hidden border-r border-border"
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
            <div className="h-full flex-1 bg-slate-800/20">
              <CanvasTopBar />
              <Suspense>
                <CanvasArea />
              </Suspense>
            </div>
          </main>
        </div>
        <AddBlocksDialog />
      </TooltipProvider>
    </div>
  );
};

export { RootLayout };

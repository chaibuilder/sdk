import React, { ComponentType, lazy, MouseEvent, Suspense, useState } from "react";
import { isDevelopment } from "../../import-html/general.ts";
import { useKeyEventWatcher } from "../../hooks/useKeyEventWatcher.ts";
import { useExpandTree } from "../../hooks/useExpandTree.ts";
import { useAtom } from "jotai";
import { useBuilderProp, useSavePage } from "../../hooks";
import "../canvas/static/BlocksExternalDataProvider.tsx";
import { ScrollArea, TooltipProvider } from "../../../ui";
import { useIntervalEffect } from "@react-hookz/web";
import { aiAssistantActiveAtom, selectedLibraryAtom } from "../../atoms/ui.ts";
import { motion } from "framer-motion";
import { Layers, PaintBucketIcon } from "lucide-react";
import { Outline, ThemeOptions } from "../../main";
import SettingsPanel from "../settings/SettingsPanel.tsx";
import { AskAI } from "../AskAi.tsx";
import { CanvasTopBar } from "../canvas/topbar/CanvasTopBar.tsx";
import CanvasArea from "../canvas/CanvasArea.tsx";
import { AddBlocksDialog } from "./AddBlocksDialog.tsx";
import { useTranslation } from "react-i18next";

const TopBar = lazy(() => import("../topbar/Topbar.tsx"));

const menuItems = [
  { icon: <Layers size={20} />, label: "Outline", component: Outline },
  { icon: <PaintBucketIcon size={20} />, label: "Theme", component: () => <ThemeOptions showHeading={false} /> },
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
  const [aiAssistantActive] = useAtom(aiAssistantActiveAtom);
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

  const [activePanelIndex, setActivePanelIndex] = useState(0);
  const handleMenuItemClick = (index: number) => {
    setActivePanelIndex(activePanelIndex === index ? null : index);
  };

  const { t } = useTranslation(); 
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
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  className={`mb-4 rounded-lg p-2 text-gray-500 transition-colors ${
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
              initial={{ width: 250 }}
              animate={{ width: activePanelIndex !== null ? 250 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}>
              {activePanelIndex !== null && (
                <ScrollArea className="h-full">
                  <div className="flex flex-col p-2">
                    <h2 className="h-10 text-base font-bold">{t(menuItems[activePanelIndex].label)}</h2>
                    <div className="flex-1">
                      <Suspense fallback={<div>Loading...</div>}>
                        {React.createElement(menuItems[activePanelIndex].component, {})}
                      </Suspense>
                    </div>
                  </div>
                </ScrollArea>
              )}
            </motion.div>
            <div className="h-full flex-1 bg-slate-800/20">
              <CanvasTopBar />
              <Suspense>
                <CanvasArea />
              </Suspense>
            </div>
            <div className="relative flex h-[100%] w-[280px] min-w-[280px] border-l border-border pb-10">
              <ScrollArea className="h-full w-full overflow-y-auto">
                <Suspense>
                  <SettingsPanel />
                </Suspense>
                {aiAssistantActive ? <AskAI /> : null}
              </ScrollArea>
            </div>
          </main>
        </div>
        <AddBlocksDialog />
      </TooltipProvider>
    </div>
  );
};

export { RootLayout };

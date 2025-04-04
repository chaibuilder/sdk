import { LightningBoltIcon } from "@radix-ui/react-icons";
import { useFeature } from "flagged";
import { motion } from "framer-motion";
import { useAtom } from "jotai";
import { compact, find, first, get } from "lodash-es";
import { Layers, Paintbrush, SparklesIcon, X } from "lucide-react";
import React, { ComponentType, lazy, MouseEvent, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../ui/index.ts";
import { sidebarActivePanelAtom } from "../../atoms/ui.ts";
import { CHAI_BUILDER_EVENTS } from "../../events.ts";
import { useChaiSidebarPanels } from "../../extensions/sidebar-panels.tsx";
import { useBuilderProp } from "../../hooks/index.ts";
import { usePubSub } from "../../hooks/usePubSub.ts";
import { useRightPanel } from "../../hooks/useTheme.ts";
import { isDevelopment } from "../../import-html/general.ts";
import { default as AIChatPanel } from "../ai/ai-chat-panel.tsx";
import { AskAI } from "../ask-ai-panel.tsx";
import CanvasArea from "../canvas/CanvasArea.tsx";
import { CanvasTopBar } from "../canvas/topbar/canvas-top-bar.tsx";
import { Outline } from "../index.ts";
import SettingsPanel from "../settings/SettingsPanel.tsx";
import ThemeConfigPanel from "../sidepanels/panels/theme-configuration/ThemeConfigPanel.tsx";
import { AddBlocksDialog } from "./AddBlocksDialog.tsx";
const TopBar = lazy(() => import("../topbar/Topbar.tsx"));

const DEFAULT_PANEL_WIDTH = 280;

function useSidebarMenuItems() {
  const askAiCallBack = useBuilderProp("askAiCallBack", null);
  const aiChat = useFeature("aiChat");
  return useMemo(() => {
    const items = [];

    items.push({
      id: "outline",
      icon: <Layers size={20} />,
      label: "Outline",
      isInternal: true,
      width: DEFAULT_PANEL_WIDTH,
      component: () => (
        <div className="-mt-8">
          <Outline />
        </div>
      ),
    });

    if (askAiCallBack && aiChat) {
      items.unshift({
        id: "ai",
        icon: <SparklesIcon size={20} />,
        label: "AI Assistant",
        isInternal: true,
        width: 450,
        component: () => (
          <div className="-mt-8 h-full max-h-full">
            <AIChatPanel />
          </div>
        ),
      });
    }
    return compact(items);
  }, [askAiCallBack, aiChat]);
}

/**
 * RootLayout is a React component that renders the main layout of the application.
 */
const RootLayout: ComponentType = () => {
  const [activePanel, setActivePanel] = useAtom(sidebarActivePanelAtom);
  const lastStandardPanelRef = useRef<string | null>("outline"); // Default to "outline"
  const [lastStandardPanelWidth, setLastStandardPanelWidth] = useState(DEFAULT_PANEL_WIDTH);

  const [panel, setRightPanel] = useRightPanel();

  usePubSub(CHAI_BUILDER_EVENTS.SHOW_BLOCK_SETTINGS, () => {
    setActivePanel("outline");
  });

  const topPanels = useChaiSidebarPanels("top");
  const bottomPanels = useChaiSidebarPanels("bottom");
  /**
   * Prevents the context menu from appearing in production mode.
   * @param {MouseEvent<HTMLDivElement>} e - The mouse event.
   */
  const preventContextMenu = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDevelopment()) e.preventDefault();
  };

  const handleMenuItemClick = (id: string) => {
    setActivePanel(activePanel === id ? null : id);
  };

  const menuItems = useSidebarMenuItems();

  const { t } = useTranslation();
  const sidebarMenuItems = useMemo(() => [...menuItems, ...topPanels], [menuItems, topPanels]);
  const htmlDir = useBuilderProp("htmlDir", "ltr");

  // Update active panel item and get its width
  const activePanelItem = find(sidebarMenuItems, { id: activePanel }) ?? first(sidebarMenuItems);
  const panelWidth = get(activePanelItem, "width", DEFAULT_PANEL_WIDTH);

  // Keep track of the last used standard panel and its width
  useEffect(() => {
    if (activePanel !== null) {
      const currentPanelItem = find(sidebarMenuItems, { id: activePanel });
      if (currentPanelItem && get(currentPanelItem, "view", "standard") === "standard") {
        lastStandardPanelRef.current = activePanel;
        setLastStandardPanelWidth(get(currentPanelItem, "width", DEFAULT_PANEL_WIDTH));
      }
    }
  }, [activePanel, sidebarMenuItems]);

  // Determine the width to use for the left panel
  const leftPanelWidth = useMemo(() => {
    if (activePanel === null) return 0;

    const currentPanelItem = find(sidebarMenuItems, { id: activePanel });
    const isStandardPanel = get(currentPanelItem, "view", "standard") === "standard";

    // If current panel is standard, use its width, otherwise use the last standard panel's width
    return isStandardPanel ? panelWidth : lastStandardPanelWidth;
  }, [activePanel, panelWidth, lastStandardPanelWidth, sidebarMenuItems]);

  const handleNonStandardPanelClose = () => {
    // Return to the last used standard panel when closing a non-standard panel
    setActivePanel(lastStandardPanelRef.current);
  };

  useEffect(() => {
    if (!find(sidebarMenuItems, { id: activePanel })) {
      setActivePanel("outline");
    }
  }, [activePanel, sidebarMenuItems]);

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
            <div id="sidebar" className="flex w-12 flex-col items-center justify-between border-r border-border py-2">
              <div className="flex flex-col">
                {sidebarMenuItems.map((item, index) => (
                  <Tooltip key={"button" + index}>
                    <TooltipTrigger asChild>
                      <Button
                        key={index}
                        variant={activePanel === item.id ? "default" : "ghost"}
                        className={`mb-2 rounded-lg p-2 transition-colors`}
                        onClick={() => handleMenuItemClick(item.id)}>
                        {get(item, "icon", null)}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side={"right"}>
                      <p>{t(item.label)}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
              <div className="flex flex-col space-y-1"></div>
              <div className="flex flex-col">
                {bottomPanels?.map((sidebarComponent, index) => {
                  return (
                    <Tooltip key={"button" + index}>
                      <TooltipTrigger asChild>
                        <Button
                          key={index}
                          variant={activePanel === sidebarComponent.id ? "default" : "ghost"}
                          className={`mb-2 rounded-lg p-2 transition-colors`}
                          onClick={() => handleMenuItemClick(sidebarComponent.id)}>
                          {get(sidebarComponent, "icon", null)}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side={"right"}>
                        <p>{t(sidebarComponent.label)}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
            {/* Side Panel */}
            <motion.div
              id="left-panel"
              className="h-full max-h-full border-r border-border"
              initial={{ width: leftPanelWidth }}
              animate={{ width: leftPanelWidth }}
              transition={{ duration: 0.3, ease: "easeInOut" }}>
              {activePanel !== null && get(activePanelItem, "view", "standard") === "standard" && (
                <div className="no-scrollbar flex h-full flex-col overflow-hidden px-3 py-2">
                  <div
                    className={`absolute top-2 flex h-10 items-center space-x-1 bg-white py-2 text-base font-bold ${get(activePanelItem, "isInternal", false) ? "" : "w-64"}`}>
                    <span className="rtl:ml-2 rtl:inline-block">{get(activePanelItem, "icon", null)}</span>
                    <span>{t(get(activePanelItem, "label", ""))}</span>
                  </div>
                  <div className="no-scrollbar h-full max-h-full overflow-y-auto pt-10">
                    <Suspense fallback={<div>Loading...</div>}>
                      {React.createElement(get(activePanelItem, "component", null), {})}
                    </Suspense>
                  </div>
                </div>
              )}
            </motion.div>
            <div id="canvas-container" className="flex h-full max-h-full flex-1 flex-col bg-slate-800/20">
              <CanvasTopBar />
              <Suspense>
                <CanvasArea />
              </Suspense>
            </div>
            <motion.div
              id="right-panel"
              className="h-full max-h-full border-l border-border"
              initial={{ width: activePanel === "ai" ? 0 : DEFAULT_PANEL_WIDTH }}
              animate={{ width: activePanel === "ai" ? 0 : DEFAULT_PANEL_WIDTH }}
              transition={{ duration: 0.3, ease: "easeInOut" }}>
              <div className="no-scrollbar overflow h-full max-h-full overflow-hidden">
                <div className="flex h-full max-h-full flex-col overflow-hidden p-3">
                  <h2 className="-mt-1 flex items-center space-x-1 text-base font-bold">
                    <div className="flex grow items-center gap-2">
                      <div className="flex w-full items-center justify-between gap-2">
                        {panel === "ai" ? (
                          <>
                            <div className="flex items-center gap-2">
                              <LightningBoltIcon className="rtl:ml-2" /> {t("AI Assistant")}
                            </div>
                          </>
                        ) : panel === "theme" ? (
                          <div className="flex w-full items-center justify-between gap-2">
                            <span className="flex items-center gap-2">
                              <Paintbrush className="h-4 w-4 rtl:ml-2" />
                              {t("Theme Settings")}
                            </span>
                            <Button
                              onClick={() => setRightPanel("block")}
                              variant="ghost"
                              size="icon"
                              className="text-xs text-gray-400">
                              <X className="h-4 w-4 rtl:ml-2" />
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </h2>
                  <div className="flex h-full max-h-full w-full">
                    <Suspense fallback={<div>Loading...</div>}>
                      {panel === "ai" ? <AskAI /> : panel === "theme" ? <ThemeConfigPanel /> : <SettingsPanel />}
                    </Suspense>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Drawer View */}
            {activePanel !== null && get(activePanelItem, "view") === "drawer" && (
              <Sheet open={true} onOpenChange={() => handleNonStandardPanelClose()}>
                <SheetContent side="left" className="p-0 sm:max-w-full" style={{ width: `${panelWidth}px` }}>
                  <SheetHeader className="border-b border-border p-4 pb-2">
                    <SheetTitle className="flex items-center gap-2">
                      <span className="rtl:ml-2 rtl:inline-block">{get(activePanelItem, "icon", null)}</span>
                      <span>{t(get(activePanelItem, "label", ""))}</span>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="h-full max-h-full overflow-y-auto p-4">
                    <Suspense fallback={<div>Loading...</div>}>
                      {React.createElement(get(activePanelItem, "component", null), {})}
                    </Suspense>
                  </div>
                </SheetContent>
              </Sheet>
            )}

            {/* Modal View */}
            {activePanel !== null && get(activePanelItem, "view") === "modal" && (
              <Dialog open={true} onOpenChange={() => handleNonStandardPanelClose()}>
                <DialogContent className="p-0" style={{ maxWidth: `${panelWidth}px` }}>
                  <DialogHeader className="border-b border-border p-4 pb-2">
                    <DialogTitle className="flex items-center gap-2">
                      <span className="rtl:ml-2 rtl:inline-block">{get(activePanelItem, "icon", null)}</span>
                      <span>{t(get(activePanelItem, "label", ""))}</span>
                    </DialogTitle>
                  </DialogHeader>
                  <div className="max-h-[70vh] overflow-y-auto p-4">
                    <Suspense fallback={<div>Loading...</div>}>
                      {React.createElement(get(activePanelItem, "component", null), {})}
                    </Suspense>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Overlay View */}
            {activePanel !== null && get(activePanelItem, "view") === "overlay" && (
              <motion.div
                className="absolute bottom-0 left-12 right-0 top-0 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}>
                <div className="h-full w-full">
                  <motion.div
                    className="flex h-full w-full flex-col bg-background"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}>
                    <div className="flex items-center justify-between border-b border-border p-4 py-2">
                      <div className="flex items-center gap-2 text-lg font-bold">
                        <span className="rtl:ml-2 rtl:inline-block">{get(activePanelItem, "icon", null)}</span>
                        <span>{t(get(activePanelItem, "label", ""))}</span>
                      </div>
                      <Button
                        onClick={() => handleNonStandardPanelClose()}
                        variant="ghost"
                        size="icon"
                        className="text-gray-400">
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                      <Suspense fallback={<div>Loading...</div>}>
                        {React.createElement(get(activePanelItem, "component", null), {})}
                      </Suspense>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </main>
        </div>
        <AddBlocksDialog />
      </TooltipProvider>
    </div>
  );
};

export { RootLayout };

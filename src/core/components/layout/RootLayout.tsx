import { LightningBoltIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { useAtom } from "jotai";
import { compact, find, get } from "lodash-es";
import { Layers, Paintbrush, SparklesIcon, X } from "lucide-react";
import React, { ComponentType, lazy, MouseEvent, Suspense, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../ui";
import { sidebarActivePanelAtom } from "../../atoms/ui.ts";
import { CHAI_BUILDER_EVENTS } from "../../events.ts";
import { useBuilderProp } from "../../hooks";
import { usePubSub } from "../../hooks/usePubSub.ts";
import { useRightPanel } from "../../hooks/useTheme.ts";
import { isDevelopment } from "../../import-html/general.ts";
import { Outline } from "../../main";
import AIChatPanel from "../ai/ai-chat-panel.tsx";
import CanvasArea from "../canvas/CanvasArea.tsx";
import { CanvasTopBar } from "../canvas/topbar/CanvasTopBar.tsx";
import SettingsPanel from "../settings/SettingsPanel.tsx";
import ThemeConfigPanel from "../sidepanels/panels/theme-configuration/ThemeConfigPanel.tsx";
import { AddBlocksDialog } from "./AddBlocksDialog.tsx";
import { ChooseLayout } from "./ChooseLayout.tsx";
const TopBar = lazy(() => import("../topbar/Topbar.tsx"));
const AI_PANEL_WIDTH = 450;
const DEFAULT_PANEL_WIDTH = 280;

function useSidebarMenuItems() {
  const askAiCallBack = useBuilderProp("askAiCallBack", null);
  return useMemo(() => {
    const items = [
      {
        id: "outline",
        icon: <Layers size={20} />,
        label: "Outline",
        isInternal: true,
        component: () => (
          <div className="-mt-8">
            <Outline />
          </div>
        ),
      },
    ];
    if (askAiCallBack) {
      items.unshift({
        id: "ai",
        icon: <SparklesIcon size={20} />,
        label: "AI Assistant",
        isInternal: true,
        component: () => (
          <div className="-mt-8 h-full max-h-full">
            <AIChatPanel />
          </div>
        ),
      });
    }
    return compact(items);
  }, [askAiCallBack]);
}

/**
 * RootLayout is a React component that renders the main layout of the application.
 */
const RootLayout: ComponentType = () => {
  const [activePanel, setActivePanel] = useAtom(sidebarActivePanelAtom);
  const [chooseLayout, setChooseLayout] = useState(false);

  const [panel, setRightPanel] = useRightPanel();

  usePubSub(CHAI_BUILDER_EVENTS.SHOW_BLOCK_SETTINGS, () => {
    setActivePanel("outline");
  });

  const topComponents = useBuilderProp("sideBarComponents.top", []);
  const sideBarBottomComponents = useBuilderProp("sideBarComponents.bottom", []);
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
  const sidebarMenuItems = useMemo(() => [...menuItems, ...topComponents], [menuItems, topComponents]);
  const htmlDir = useBuilderProp("htmlDir", "ltr");

  const activePanelItem = find(sidebarMenuItems, { id: activePanel });
  const panelWidth = activePanel === "ai" ? AI_PANEL_WIDTH : DEFAULT_PANEL_WIDTH;

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
            <div className="flex h-full w-12 flex-col items-center justify-between border-r border-border py-2">
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
              <div className="flex h-full flex-col">
                {sideBarBottomComponents?.map((sidebarComponent, index) => {
                  return (
                    <Suspense key={`sidebar-component-${index}`} fallback={<div />}>
                      {React.createElement(sidebarComponent, {})}
                    </Suspense>
                  );
                })}
              </div>
            </div>
            {/* Side Panel */}
            <motion.div
              className="h-full max-h-full border-r border-border"
              initial={{ width: panelWidth }}
              animate={{ width: activePanel !== null ? panelWidth : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}>
              {activePanel !== null && (
                <div className="no-scrollbar flex h-full flex-col overflow-hidden px-3 py-2">
                  <div
                    className={`absolute top-2 flex h-10 items-center space-x-1 bg-white py-2 text-base font-bold ${get(activePanelItem, "isInternal", false) ? "" : "w-64"}`}>
                    <span className="rtl:ml-2 rtl:inline-block">{get(activePanelItem, "icon", null)}</span>
                    <span>{t(activePanelItem?.label)}</span>
                  </div>
                  <div className="no-scrollbar h-full max-h-full overflow-y-auto pt-10">
                    <Suspense fallback={<div>Loading...</div>}>
                      {React.createElement(get(activePanelItem, "component", null), {})}
                    </Suspense>
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
            <motion.div
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
                      {panel === "theme" ? <ThemeConfigPanel /> : <SettingsPanel />}
                    </Suspense>
                  </div>
                </div>
              </div>
            </motion.div>
          </main>
        </div>
        <AddBlocksDialog />
        <ChooseLayout open={chooseLayout} close={() => setChooseLayout(false)} />
      </TooltipProvider>
    </div>
  );
};

export { RootLayout };

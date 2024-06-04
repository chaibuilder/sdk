import React, { lazy, MouseEvent, Suspense, useEffect } from "react";
import { isDevelopment } from "../import-html/general";
import { PreviewScreen } from "./PreviewScreen";
import { useKeyEventWatcher } from "../hooks/useKeyEventWatcher.ts";
import { useExpandTree } from "../hooks/useExpandTree";
import { useAtom } from "jotai";
import { pageSyncStateAtom } from "../hooks/useSavePage.ts";
import "./canvas/static/BlocksExternalDataProvider.tsx";
import { useBuilderProp } from "../hooks";
import { TooltipProvider } from "../../ui";

const SidePanels = lazy(() => import("./sidepanels/SidePanels"));
const TopBar = lazy(() => import("./topbar/Topbar"));
const CanvasArea = lazy(() => import("./canvas/CanvasArea"));
const Settings = lazy(() => import("./settings/Settings"));

/**
 * RootLayout is a React component that renders the main layout of the application.
 */
const RootLayout: React.FC = () => {
  const [syncState] = useAtom(pageSyncStateAtom);
  /**
   * Prevents the context menu from appearing in production mode.
   * @param {MouseEvent<HTMLDivElement>} e - The mouse event.
   */
  const preventContextMenu = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDevelopment()) e.preventDefault();
  };

  useKeyEventWatcher();
  useExpandTree();

  useEffect(() => {
    if (syncState !== "SAVED") {
      window.onbeforeunload = () => "";
    } else {
      window.onbeforeunload = null;
    }

    return () => {
      window.onbeforeunload = null;
    };
  }, [syncState]);
  const editable = useBuilderProp("editable", true);
  const NonEditable = useBuilderProp("nonEditableComponent", null);

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
            {!editable ? (
              <div className="absolute inset-0 z-[500] flex h-full w-full items-center justify-center backdrop-blur-[2px]">
                <Suspense>{React.createElement(NonEditable)}</Suspense>
              </div>
            ) : null}
            <div className="flex h-full max-h-full w-fit border-border" style={{ maxHeight: "calc(100vh - 56px)" }}>
              <Suspense>
                <SidePanels />
              </Suspense>
            </div>
            <div className="h-full flex-1 bg-slate-800/20">
              <Suspense>
                <CanvasArea />
              </Suspense>
            </div>
            <div className="flex h-[90%] w-[280px] min-w-[280px] border-l border-border pb-10">
              <Suspense>
                <Settings />
              </Suspense>
            </div>
          </main>
        </div>
        <PreviewScreen />
      </TooltipProvider>
    </div>
  );
};

export { RootLayout };

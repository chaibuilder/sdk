import { Breakpoints } from "@/core/components/canvas/topbar/canvas-breakpoints";
import { ClearCanvas } from "@/core/components/canvas/topbar/clear-canvas";
import { DarkMode } from "@/core/components/canvas/topbar/dark-mode";
import { DataBinding } from "@/core/components/canvas/topbar/data-binding";
import { UndoRedo } from "@/core/components/canvas/topbar/undo-redo";
import { useBuilderProp } from "@/core/hooks";
import { Separator } from "@/ui/shadcn/components/ui/separator";
import React from "react";

const CanvasTopBar: React.FC = () => {
  const darkModeSupport = useBuilderProp("darkMode", true);

  return (
    <div className="flex h-10 items-center justify-between border-b border-border bg-background/70 px-2 shadow-xl">
      <div className="flex h-full space-x-2">
        <Breakpoints canvas openDelay={400} />

        <Separator orientation="vertical" />
        {darkModeSupport ? (
          <>
            <DarkMode />
            <Separator orientation="vertical" />
          </>
        ) : null}

        <UndoRedo />
        <DataBinding />
      </div>
      <div className="flex h-full items-center space-x-2">
        <ClearCanvas />
      </div>
    </div>
  );
};

export { CanvasTopBar };

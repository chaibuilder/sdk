import { AiAssistant } from "@/core/components/canvas/topbar/ai-assistant";
import { Breakpoints } from "@/core/components/canvas/topbar/canvas-breakpoints";
import { ClearCanvas } from "@/core/components/canvas/topbar/clear-canvas";
import { DarkMode } from "@/core/components/canvas/topbar/dark-mode";
import { DataBinding } from "@/core/components/canvas/topbar/data-binding";
import { UndoRedo } from "@/core/components/canvas/topbar/undo-redo";
import { useBuilderProp, useCanvasZoom } from "@/core/hooks";
import { Separator } from "@/ui/shadcn/components/ui/separator";
import { ZoomInIcon } from "@radix-ui/react-icons";
import { useFeature } from "flagged";
import { round } from "lodash-es";
import React from "react";

const CanvasTopBar: React.FC = () => {
  const darkModeSupport = useBuilderProp("darkMode", true);
  const aiChat = useFeature("aiChat");
  const [zoom] = useCanvasZoom();

  return (
    <div className="flex h-10 items-center justify-between border-b border-border bg-background/70 px-2">
      <div className="flex h-full space-x-2">
        <Breakpoints canvas openDelay={400} />
        <Separator orientation="vertical" />
        {darkModeSupport ? (
          <>
            <DarkMode />
            <Separator orientation="vertical" />
          </>
        ) : null}
        <div className="flex w-12 cursor-not-allowed items-center justify-center gap-x-1 space-x-0 font-medium text-gray-400">
          <ZoomInIcon className="h-3.5 w-3.5 flex-shrink-0" />{" "}
          <div className="text-xs leading-3">{round(zoom, 0)}%</div>
        </div>
        <Separator orientation="vertical" />
        <UndoRedo />
        <DataBinding />
      </div>
      <div className="flex h-full items-center space-x-2">
        <ClearCanvas />
        {!aiChat ? <AiAssistant /> : null}
      </div>
    </div>
  );
};

export { CanvasTopBar };

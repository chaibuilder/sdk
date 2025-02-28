import { ZoomInIcon } from "@radix-ui/react-icons";
import { round } from "lodash-es";
import React from "react";
import { Separator } from "../../../../ui";
import { useBuilderProp, useCanvasZoom } from "../../../hooks";
import { AiAssistant } from "./AiAssistant";
import { Breakpoints } from "./Breakpoints";
import { ClearCanvas } from "./ClearCanvas";
import { DarkMode } from "./DarkMode";
import { DataBinding } from "./DataBinding";
import { UndoRedo } from "./UndoRedo";

const CanvasTopBar: React.FC = () => {
  const darkModeSupport = useBuilderProp("darkMode", true);
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
        <AiAssistant />
      </div>
    </div>
  );
};

export { CanvasTopBar };

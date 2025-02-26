import { useMemo } from "react";
import { useCanvasWidth } from "../../../hooks";
import { Breakpoints, WEB_BREAKPOINTS } from "../../canvas/topbar/Breakpoints";

export function BreakpointSelector() {
  const [, breakpoint] = useCanvasWidth();

  const message = useMemo(() => {
    const currentBreakpoint = WEB_BREAKPOINTS.find((bp) => bp.breakpoint === breakpoint);
    return currentBreakpoint?.content;
  }, [breakpoint, WEB_BREAKPOINTS]);

  return (
    <>
      <div className="sticky top-0 z-10 flex items-center justify-start bg-muted px-2 py-1 shadow-sm">
        <p className="text-xs text-muted-foreground">Screen:&nbsp;</p>
        <Breakpoints openDelay={500} />
      </div>
      <div className="flex items-center justify-between rounded-md rounded-t-none border border-border p-1">
        <p className="flex-1 text-[10px] text-muted-foreground">{message}</p>
      </div>
    </>
  );
}

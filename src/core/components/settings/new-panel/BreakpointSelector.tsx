import { useMemo } from "react";
import { useScreenSizeWidth } from "../../../hooks";
import { Breakpoints, WEB_BREAKPOINTS } from "../../canvas/topbar/Breakpoints";

export function BreakpointSelector() {
  const [, breakpoint] = useScreenSizeWidth();

  const message = useMemo(() => {
    const currentBreakpoint = WEB_BREAKPOINTS.find((bp) => bp.breakpoint === breakpoint);
    return currentBreakpoint?.content;
  }, [breakpoint, WEB_BREAKPOINTS]);

  return (
    <>
      <div className="sticky top-0 z-10 flex items-center justify-start bg-muted px-2 py-1 shadow-sm">
        <p className="text-xs text-muted-foreground">Screen:&nbsp;</p>
        <Breakpoints openDelay={1000} tooltip={false} />
      </div>
      <div className="mb-2 flex items-center justify-between rounded-md rounded-t-none border border-border p-1">
        <p className="flex flex-1 items-center space-x-2 text-[10px] text-foreground">
          <span className="text-xs text-foreground">
            <span className="rounded-md bg-muted px-1 py-px text-xs font-bold uppercase text-muted-foreground">
              {breakpoint === "xs" ? "Base" : breakpoint}
            </span>
            &nbsp; {message}
          </span>
        </p>
      </div>
    </>
  );
}

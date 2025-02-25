import { includes, map, toUpper } from "lodash-es";
import { Button } from "../../../../ui";

import { useBuilderProp, useCanvasWidth, useSelectedBreakpoints } from "../../../hooks";
import { BreakpointCardProps, BreakpointItemType, WEB_BREAKPOINTS } from "../../canvas/topbar/Breakpoints";

const BreakpointCard = ({ currentBreakpoint, breakpoint, width, icon, onClick }: BreakpointCardProps) => {
  return (
    <Button
      onClick={() => onClick(width)}
      size="sm"
      className="h-6 w-6 rounded-md p-1"
      variant={breakpoint === currentBreakpoint ? "default" : "secondary"}>
      {icon}
    </Button>
  );
};
export function BreakpointSelector() {
  const [, breakpoint, setNewWidth] = useCanvasWidth();
  const [selectedBreakpoints] = useSelectedBreakpoints();
  const breakpoints = useBuilderProp("breakpoints", WEB_BREAKPOINTS);

  if (breakpoints.length < 4) {
    return (
      <div className="flex items-center rounded-md">
        {map(breakpoints, (bp) => (
          <BreakpointCard {...bp} onClick={setNewWidth} key={bp.breakpoint} currentBreakpoint={breakpoint} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-start rounded-md bg-muted px-2 py-1">
      <p className="text-xs text-muted-foreground">Breakpoints: </p>
      {map(
        breakpoints.filter((bp: BreakpointItemType) => includes(selectedBreakpoints, toUpper(bp.breakpoint))),
        (bp: BreakpointItemType) => (
          <BreakpointCard {...bp} onClick={setNewWidth} key={bp.breakpoint} currentBreakpoint={breakpoint} />
        ),
      )}
    </div>
  );
}

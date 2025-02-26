import { atom, useAtom, useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useEffect } from "react";
import { getBreakpointValue } from "../functions/Functions.ts";
import { useStylingBreakpoint } from "./useStylingBreakpoint";

export const canvasWidthAtom = atomWithStorage("canvasWidth", 800);
export const canvasDisplayWidthAtom = atomWithStorage("canvasDisplayWidth", 800);

export const canvasBreakpointAtom = atom((get) => {
  const width: number = get(canvasWidthAtom);
  return getBreakpointValue(width).toLowerCase();
});

/**
 *
 */
export const useCanvasWidth = () => {
  const [currentWidth, setCanvasWidth] = useAtom(canvasWidthAtom);
  const [canvasDisplayWidth, setCanvasDisplayWidth] = useAtom(canvasDisplayWidthAtom);
  const breakpoint = useAtomValue(canvasBreakpointAtom);
  const [stylingBreakpoint, setStylingBreakpoint] = useStylingBreakpoint();

  useEffect(() => {
    if (stylingBreakpoint !== "xs") {
      setStylingBreakpoint(breakpoint);
    }
  }, [breakpoint, stylingBreakpoint, setStylingBreakpoint]);

  return [currentWidth, breakpoint, setCanvasWidth, canvasDisplayWidth, setCanvasDisplayWidth] as const;
};

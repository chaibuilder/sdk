import { styleBreakpointAtom } from "@/core/hooks/use-selected-blockIds";
import { useAtom } from "jotai";

export const useStylingBreakpoint = () => useAtom(styleBreakpointAtom);

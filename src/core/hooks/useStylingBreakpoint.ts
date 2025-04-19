import { styleBreakpointAtom } from "@/core/hooks/useSelectedBlockIds";
import { useAtom } from "jotai";

export const useStylingBreakpoint = () => useAtom(styleBreakpointAtom);

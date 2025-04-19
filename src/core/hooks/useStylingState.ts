import { styleStateAtom } from "@/core/hooks/useSelectedBlockIds";
import { useAtom } from "jotai";

export const useStylingState = () => useAtom(styleStateAtom);

import { useAtom } from "jotai";
import { canvasIframeAtom } from "@/core/atoms/ui";

export const useCanvasIframe = () => useAtom(canvasIframeAtom);

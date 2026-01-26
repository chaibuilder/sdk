import { canvasIframeAtom } from "@/atoms/ui";
import { useAtom } from "jotai";

export const useCanvasIframe = () => useAtom(canvasIframeAtom);

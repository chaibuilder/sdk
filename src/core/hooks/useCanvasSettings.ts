import { canvasSettingsAtom } from "@/core/atoms/ui";
import { useAtom } from "jotai";

export const useCanvasSettings = () => {
  return useAtom(canvasSettingsAtom);
};

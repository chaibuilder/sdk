import { useFrame } from "@/core/frame";
import { useKeyEventWatcher } from "@/core/hooks/useKeyEventWatcher.ts";

export const KeyboardHandler = () => {
  const { document: iframeDoc } = useFrame();
  useKeyEventWatcher(iframeDoc);
  return null;
};

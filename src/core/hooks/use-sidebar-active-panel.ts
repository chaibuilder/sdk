import { atom, useAtom } from "jotai";

export const sidebarActivePanelAtom = atom<string>("outline");
sidebarActivePanelAtom.debugLabel = "sidebarActivePanelAtom";

export const useSidebarActivePanel = () => {
  return useAtom(sidebarActivePanelAtom);
};

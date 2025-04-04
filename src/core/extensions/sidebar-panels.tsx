import { filter, has, set, values } from "lodash-es";
import { ComponentType, useMemo } from "react";

interface ChaiSidebarPanel<T> {
  id: string;
  position: "top" | "bottom";
  view?: "standard" | "modal" | "overlay" | "drawer";
  icon: React.ReactNode;
  label: string;
  component: ComponentType;
  showIf?: (params: T) => boolean;
  width?: number;
  isInternal?: boolean;
}

// Export for testing purposes
export const CHAI_BUILDER_PANELS: Record<string, ChaiSidebarPanel<any>> = {};

export const registerChaiSidebarPanel = <T extends Record<string, any>>(
  panelId: string,
  panelOptions: Omit<ChaiSidebarPanel<T>, "id">,
) => {
  if (has(CHAI_BUILDER_PANELS, panelId)) {
    console.warn(`Panel ${panelId} already registered. Overriding...`);
  }
  set(CHAI_BUILDER_PANELS, panelId, { id: panelId, ...panelOptions });
};

export const useChaiSidebarPanels = (position: "top" | "bottom") => {
  return useMemo(() => filter(values(CHAI_BUILDER_PANELS), (panel) => panel.position === position), [position]);
};

export const LAYOUT_MODE: Record<string, string> = {
  SINGLE_SIDE_PANEL: "SINGLE_SIDE_PANEL",
  DUAL_SIDE_PANEL: "DUAL_SIDE_PANEL",
  DUAL_SIDE_PANEL_ADVANCED: "DUAL_SIDE_PANEL_ADVANCED",
};

export type LayoutVariant = keyof typeof LAYOUT_MODE;

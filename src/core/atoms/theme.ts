import { atom } from "jotai";
import { ChaiBuilderThemeValues } from "../types/chaiBuilderEditorProps";

const defaultThemeValues: ChaiBuilderThemeValues = {
  fontFamily: {
    heading: "Inter",
    body: "Inter",
  },
  borderRadius: "0.5rem",
  colors: {
    // Base
    background: { light: "#FFFFFF", dark: "#020817" },
    foreground: { light: "#1C2127", dark: "#E3E8EF" },

    // Muted
    muted: { light: "#F1F5F9", dark: "#131C2C" },
    mutedForeground: { light: "#64748B", dark: "#8B97A7" },

    // Card
    card: { light: "#FFFFFF", dark: "#020817" },
    cardForeground: { light: "#1C2127", dark: "#E3E8EF" },

    // Popover
    popover: { light: "#FFFFFF", dark: "#020817" },
    popoverForeground: { light: "#1C2127", dark: "#94A3B8" },

    // Border & Input
    border: { light: "#E2E8F0", dark: "#1E293B" },
    input: { light: "#E2E8F0", dark: "#1E293B" },
    ring: { light: "#94A3B8", dark: "#1E293B" },

    // Primary
    primary: { light: "#1C2127", dark: "#F8FAFC" },
    primaryForeground: { light: "#F8FAFC", dark: "#1C2127" },

    // Secondary
    secondary: { light: "#F1F5F9", dark: "#1C2127" },
    secondaryForeground: { light: "#1C2127", dark: "#F8FAFC" },

    // Accent
    accent: { light: "#F1F5F9", dark: "#1E293B" },
    accentForeground: { light: "#1C2127", dark: "#F8FAFC" },

    // Destructive
    destructive: { light: "#FF0000", dark: "#7E1D1D" },
    destructiveForeground: { light: "#F8FAFC", dark: "#F8FAFC" },
  },
};

export const themeValuesAtom = atom<ChaiBuilderThemeValues>(defaultThemeValues);
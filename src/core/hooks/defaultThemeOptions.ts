import { ChaiBuilderThemeOptions } from "../types/chaiBuilderEditorProps";

export const defaultThemeOptions: ChaiBuilderThemeOptions = {
  fontFamily: {
    "font-heading": "Inter",
    "font-body": "Inter",
  },
  borderRadius: "10px",
  colors: [
    {
      group: "Body",
      items: {
        background: ["#FFFFFF", "#121212"],
        foreground: ["#121212", "#FFFFFF"],
      },
    },
    {
      group: "Primary",
      items: {
        primary: ["#2563EB", "#3B82F6"],
        "primary-foreground": ["#FFFFFF", "#FFFFFF"],
      },
    },
    {
      group: "Secondary",
      items: {
        secondary: ["#F3F4F6", "#374151"],
        "secondary-foreground": ["#1F2937", "#F9FAFB"],
      },
    },
    {
      group: "Border, Input & Ring",
      items: {
        border: ["#E5E7EB", "#374151"],
        input: ["#E5E7EB", "#374151"],
        ring: ["#2563EB", "#3B82F6"],
      },
    },
    {
      group: "Card",
      items: {
        card: ["#FFFFFF", "#1F2937"],
        "card-foreground": ["#121212", "#FFFFFF"],
      },
    },
    {
      group: "Popover",
      items: {
        popover: ["#FFFFFF", "#1F2937"],
        "popover-foreground": ["#121212", "#FFFFFF"],
      },
    },
    {
      group: "Muted",
      items: {
        muted: ["#F3F4F6", "#374151"],
        "muted-foreground": ["#6B7280", "#9CA3AF"],
      },
    },
    {
      group: "Accent",
      items: {
        accent: ["#F3F4F6", "#374151"],
        "accent-foreground": ["#1F2937", "#FFFFFF"],
      },
    },
    {
      group: "Destructive",
      items: {
        destructive: ["#DC2626", "#EF4444"],
        "destructive-foreground": ["#FFFFFF", "#FFFFFF"],
      },
    },
  ],
};

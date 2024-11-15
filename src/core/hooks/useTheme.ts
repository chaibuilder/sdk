import { atom, useAtom } from "jotai";
import { BorderRadiusValue, ChaiBuilderThemeOptions, ChaiBuilderThemeValues } from "../types/chaiBuilderEditorProps";
import { useBuilderProp } from "./useBuilderProp";
import { useMemo } from "react";
import { isEmpty } from "lodash";

const defaultThemeOptions: ChaiBuilderThemeOptions = {
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

const getDefaultThemeValues = (options: ChaiBuilderThemeOptions): Partial<ChaiBuilderThemeValues> => {
  const themeValues: Partial<ChaiBuilderThemeValues> = {};

  if (options.fontFamily) {
    themeValues.fontFamily = Object.entries(options.fontFamily).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key.replace("font-", "")]: value,
      }),
      {},
    );
  }

  // @ts-ignore
  themeValues.borderRadius = options.borderRadius as BorderRadiusValue;

  if (options.colors) {
    themeValues.colors = options.colors.reduce(
      (acc, colorGroup) => {
        Object.entries(colorGroup.items).forEach(([key, values]) => {
          acc[key] = values;
        });
        return acc;
      },
      {} as Record<string, string[]>,
    );
  }

  return themeValues;
};

// Create a new atom for changeable theme values, initialized with default values
const chaiThemeValuesAtom = atom<ChaiBuilderThemeValues | Partial<ChaiBuilderThemeValues>>({});

export const useTheme = () => {
  const options = useThemeOptions();
  const defaultThemeValues = useMemo(() => getDefaultThemeValues(options), [options]);
  const theme = useBuilderProp("theme", {});
  const [chaiTheme, setChaiTheme] = useAtom(chaiThemeValuesAtom);

  return [
    { ...defaultThemeValues, ...(!isEmpty(theme) && theme), ...(!isEmpty(chaiTheme) && chaiTheme) },
    setChaiTheme,
  ] as const;
};

export const useThemeOptions = () => {
  const getThemeOptions = useBuilderProp("themeOptions", (themeOptions: ChaiBuilderThemeOptions) => themeOptions);
  const defaultOptions = useMemo(() => getThemeOptions(defaultThemeOptions), [getThemeOptions]);
  return defaultOptions as ChaiBuilderThemeOptions;
};

const rightPanelAtom = atom<"block" | "theme" | "ai">("block");
export const useRightPanel = () => {
  return useAtom(rightPanelAtom);
};

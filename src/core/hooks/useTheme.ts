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
  borderRadius: "0.5rem",
  colors: [
    {
      group: "Body",
      items: {
        background: ["0 0% 100%", "20 14% 4%"],
        foreground: ["20 14% 4%", "210 40% 98%"],
      },
    },
    {
      group: "Primary",
      items: {
        primary: ["47.9 95.8% 53.1%", "47.9 95.8% 53.1%"],
        "primary-foreground": ["26 83.3% 14.1%", "26 83.3% 14.1%"],
      },
    },
    {
      group: "Secondary",
      items: {
        secondary: ["60 4.8% 95.9%", "12 6.5% 15.1%"],
        "secondary-foreground": ["24 9.8% 10%", "210 40% 98%"],
      },
    },
    {
      group: "Border, Input & Ring",
      items: {
        border: ["20 5.9% 90%", "12 6.5% 15.1%"],
        input: ["20 5.9% 90%", "12 6.5% 15.1%"],
        ring: ["20 14.3% 4%", "210 40% 98%"],
      },
    },
    {
      group: "Card",
      items: {
        card: ["0 0% 100%", "20 14% 4%"],
        "card-foreground": ["20 14% 4%", "210 40% 98%"],
      },
    },
    {
      group: "Popover",
      items: {
        popover: ["0 0% 100%", "20 14% 4%"],
        "popover-foreground": ["20 14% 4%", "210 40% 98%"],
      },
    },
    {
      group: "Muted",
      items: {
        muted: ["60 4.8% 95.9%", "12 6.5% 15.1%"],
        "muted-foreground": ["25 5.3% 44.7%", "210 40% 98%"],
      },
    },
    {
      group: "Accent",
      items: {
        accent: ["60 4.8% 95.9%", "12 6.5% 15.1%"],
        "accent-foreground": ["24 9.8% 10%", "210 40% 98%"],
      },
    },
    {
      group: "Destructive",
      items: {
        destructive: ["0 84.2% 60.2%", "0 62.8% 30.6%"],
        "destructive-foreground": ["210 40% 98%", "210 40% 98%"],
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
  ];
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

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
        background: ["#fff", "#000"],
        foreground: ["#000", "#fff"],
      },
    },
    {
      group: "Primary",
      items: {
        primary: ["#000", "#fff"],
        "primary-foreground": ["#fff", "#000"],
      },
    },
    {
      group: "Secondary",
      items: {
        secondary: ["#000", "#fff"],
        "secondary-foreground": ["#fff", "#000"],
      },
    },
    {
      group: "Border, Input & Ring",
      items: {
        border: ["#000", "#fff"],
        input: ["#000", "#fff"],
        ring: ["#000", "#fff"],
      },
    },
    {
      group: "Card",
      items: {
        card: ["#fff", "#000"],
        "card-foreground": ["#000", "#fff"],
      },
    },
    {
      group: "Popover",
      items: {
        popover: ["#fff", "#000"],
        "popover-foreground": ["#000", "#fff"],
      },
    },
    {
      group: "Muted",
      items: {
        muted: ["#000", "#fff"],
        "muted-foreground": ["#fff", "#000"],
      },
    },
    {
      group: "Accent",
      items: {
        accent: ["#000", "#fff"],
        "accent-foreground": ["#fff", "#000"],
      },
    },
    {
      group: "Destructive",
      items: {
        destructive: ["#000", "#fff"],
        "destructive-foreground": ["#fff", "#000"],
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

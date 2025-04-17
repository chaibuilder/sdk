import { atom, useAtom } from "jotai";
import { isEmpty } from "lodash-es";
import { useMemo } from "react";
import {
  BorderRadiusValue,
  ChaiBuilderThemeOptions,
  ChaiBuilderThemeValues,
} from "../../types/chaibuilder-editor-props";
import { defaultThemeOptions, defaultThemeValues } from "./defaultThemeOptions";
import { useBuilderProp } from "./useBuilderProp";

export const getDefaultThemeValues = (
  options: ChaiBuilderThemeOptions = defaultThemeOptions,
): ChaiBuilderThemeValues => {
  const themeValues: ChaiBuilderThemeValues = defaultThemeValues;

  if (options.fontFamily) {
    themeValues.fontFamily = Object.entries(options.fontFamily).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key.replace("font-", "")]: value,
      }),
      themeValues.fontFamily,
    );
  }

  // @ts-ignore
  themeValues.borderRadius = options.borderRadius as BorderRadiusValue;

  if (options.colors) {
    themeValues.colors = options.colors.reduce((acc, colorGroup) => {
      Object.entries(colorGroup.items).forEach(([key, values]) => {
        acc[key] = values;
      });
      return acc;
    }, themeValues.colors);
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

  const themeValues = useMemo(
    () => ({ ...defaultThemeValues, ...(!isEmpty(theme) && theme), ...(!isEmpty(chaiTheme) && chaiTheme) }),
    [defaultThemeValues, theme, chaiTheme],
  );
  return [themeValues, setChaiTheme] as const;
};

export const useThemeOptions = () => {
  const getThemeOptions = useBuilderProp("themeOptions", (themeOptions: ChaiBuilderThemeOptions) => themeOptions);
  const defaultOptions = useMemo(() => getThemeOptions(defaultThemeOptions), [getThemeOptions]);
  return defaultOptions as ChaiBuilderThemeOptions;
};

const rightPanelAtom = atom<"block" | "theme" | "ai" | "settings">("block");
export const useRightPanel = () => {
  return useAtom(rightPanelAtom);
};

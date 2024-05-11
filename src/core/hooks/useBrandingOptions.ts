import { atom, useAtom } from "jotai";
import { BRANDING_OPTIONS_DEFAULTS } from "../constants/MODIFIERS";
import { isObject } from "lodash-es";

type BrandingOptions = {
  bodyBgDarkColor: string;
  bodyBgLightColor: string;
  bodyFont: string;
  bodyTextDarkColor: string;
  bodyTextLightColor: string;
  headingFont: string;
  primaryColor: string;
  roundedCorners: number;
  secondaryColor: string;
} & Record<string, string>;

export const brandingOptionsAtom = atom<any>(BRANDING_OPTIONS_DEFAULTS as BrandingOptions);

/**
 * Wrapper around useAtom
 */
export const useBrandingOptions = () => {
  const [brandingOptions, setBrandingOptions] = useAtom(brandingOptionsAtom);
  return [
    isObject(brandingOptions) ? { ...BRANDING_OPTIONS_DEFAULTS, ...brandingOptions } : BRANDING_OPTIONS_DEFAULTS,
    setBrandingOptions,
  ] as const;
};

import { ChaiBlock } from "./ChaiBlock";

export type PredefinedBlock = {
  uuid: string;
  name: string;
  preview: string;
  blocks?: ChaiBlock[];
  html?: string;
};

export type ChaiPage = {
  uuid?: string;
  page_name?: string;
  blocks: ChaiBlock[];
  custom_code: string;
  seo_data: Record<string, string>;
  slug: string;
  translations: Record<string, Record<string, string>>;
};

export type StylingAttributes = {
  className: string;
  "data-block-parent": string;
  "data-style-id": string;
  "data-style-prop": string;
  onClick?: (e: any) => void;
  onMouseEnter?: (e: any) => void;
  onMouseLeave?: (e: any) => void;
};

export type BrandingOptions = {
  bodyTextLightColor?: string;
  bodyTextDarkColor?: string;
  bodyBgLightColor?: string;
  bodyBgDarkColor?: string;
};

import { ChaiBlock } from "./ChaiBlock";
import type { ChaiBuilderEditorProps } from "./chaiBuilderEditorProps.ts";

export type { ChaiBuilderEditorProps };

export type ChaiPage = {
  uuid?: string;
  page_name?: string;
  blocks: ChaiBlock[];
  custom_code: string;
  seo_data: Record<string, string>;
  slug: string;
  translations: Record<string, Record<string, string>>;
};

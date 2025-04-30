import type { ChaiBuilderEditorProps } from "@/types/chaibuilder-editor-props";
import { ChaiPageProps } from "@chaibuilder/runtime";

export type { ChaiBuilderEditorProps };

export type ChaiPage = {
  slug: string;
  uuid?: string;
  name?: string;
};

export type ChaiAsset = {
  url: string;
  id?: string;
  thumbnailUrl?: string;
  description?: string;
  width?: number;
  height?: number;
};

export type { ChaiPageProps };

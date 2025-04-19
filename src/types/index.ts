import type { ChaiBuilderEditorProps } from "@/types/chaibuilder-editor-props";
import { ChaiPageProps } from "@chaibuilder/runtime";

export type { ChaiBuilderEditorProps };

export type ChaiPage = {
  slug: string;
  uuid?: string;
  name?: string;
};

export type { ChaiPageProps };

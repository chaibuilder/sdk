import { ChaiPageProps } from "@chaibuilder/runtime";
import type { ChaiBuilderEditorProps } from "./chaibuilder-editor-props.ts";

export type { ChaiBuilderEditorProps };

export type ChaiPage = {
  slug: string;
  uuid?: string;
  name?: string;
};

export type { ChaiPageProps };

import * as React from "react";

export * from "@/types/chai-block";

export type ChaiRenderBlockProps<T> = {
  blockProps: Record<string, string>;
  children?: React.ReactNode;
  inBuilder: boolean;
} & T;

export type ChaiBlockStyles = Record<string, string>;

export type { ChaiThemeValues as ChaiBuilderThemeValues, SavePageData } from "@/types/chaibuilder-editor-props";

import * as React from "react";

export * from "./chai-block.ts";

export type ChaiRenderBlockProps<T> = {
  blockProps: Record<string, string>;
  children?: React.ReactNode;
  inBuilder: boolean;
} & T;

export type ChaiBlockStyles = Record<string, string>;

export type { ChaiBuilderThemeValues, SavePageData } from "./chaibuilder-editor-props.ts";

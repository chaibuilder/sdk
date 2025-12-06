import * as React from "react";

export * from "@/types/chai-block";

export type ChaiRenderBlockProps<T> = {
  blockProps: Record<string, string>;
  children?: React.ReactNode;
  inBuilder: boolean;
} & T;

export type ChaiBlockStyles = Record<string, string>;

export type { ChaiThemeValues as ChaiBuilderThemeValues, SavePageData } from "@/types/chaibuilder-editor-props";

export interface DesignTokens {
  [uniqueId: string]: {
    name: string;
    value: string;
  };
}

type BlocksWithDesignTokens = Record<string, string>;
export interface SiteWideUsage {
  [pageId: string]: {
    name: string;
    isPartial: boolean;
    partialBlocks: string[];
    links: string[];
    designTokens: BlocksWithDesignTokens; // { blockId: Name, blockId: name 2}
  };
}

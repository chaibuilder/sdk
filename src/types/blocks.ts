import React from "react";
import { ChaiBlock, ChaiBlockSchema, ChaiBlockUiSchema, ChaiPageProps } from "./common";

export type ChaiBlockComponentProps<BlockProps, PageData = Record<string, unknown>> = ChaiBlock<BlockProps> & {
  // Chai Block Props
  $loading?: boolean;
  blockProps: Record<string, string>;
  inBuilder: boolean;
  lang: string;
  draft: boolean;
  pageProps?: ChaiPageProps;
  pageData?: PageData;
  //React Node
  children?: React.ReactNode;
};

export type ChaiStyles = {
  [key: string]: string;
};

export type ChaiAsyncProp<T> = T | undefined;
export type ChaiClosestBlockProp<T> = T | undefined;
export type ChaiDataProviderArgs<T = Record<string, any>, K = Record<string, any>> = {
  block: ChaiBlock<T>;
} & K;

export interface ChaiBlockDefinition<T = Record<string, any>, K = Record<string, any>> {
  // required
  component: React.ComponentType<ChaiBlockComponentProps<T>>;
  type: string;
  label: string;
  group: string;

  // optional
  description?: string;
  wrapper?: boolean;
  blocks?: ChaiBlock[] | (() => ChaiBlock[]);
  category?: string;
  hidden?: boolean | ((parentType?: string) => boolean);
  icon?: React.ReactNode | React.ComponentType;

  dataProviderMode?: "live" | "mock";
  dataProviderDependencies?: string[];
  dataProvider?: (args: {
    lang: string;
    draft: boolean;
    inBuilder: boolean;
    block: ChaiBlock<T>;
    pageProps: ChaiPageProps;
  }) => K;

  //props
  schema?: ChaiBlockSchema;
  uiSchema?: ChaiBlockUiSchema;

  i18nProps?: string[];
  aiProps?: string[];
  inlineEditProps?: string[];

  // callbacks
  canAcceptBlock?: (type: string) => boolean;
  canDelete?: () => boolean;
  canMove?: () => boolean;
  canDuplicate?: () => boolean;
  canBeNested?: (type: string) => boolean;
}

export interface ChaiServerBlockDefinition<T = Record<string, any>, K = Record<string, any>> {
  component: React.ComponentType<ChaiBlockComponentProps<T>>;
  type: string;
  dataProvider?: (args: {
    draft: boolean;
    inBuilder: boolean;
    lang: string;
    block: ChaiBlock<T>;
    pageProps: ChaiPageProps;
  }) => Promise<K>;
  suspenseFallback?: React.ComponentType<any>;
}

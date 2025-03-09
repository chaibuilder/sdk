import React, { ReactNode } from "react";
import { LayoutVariant } from "../constants/LAYOUT_MODE.ts";
import { ChaiBlock } from "./ChaiBlock";

type RichText = string;

export type UiLibraryBlock = {
  uuid: string;
  group: string;
  name?: string;
  path: string;
  preview?: string;
  tags?: string[];
  description?: string;
};

export interface UILibrary {
  uuid: string;
  name: string;
  url: string;
  blocks?: UiLibraryBlock[];
  link?: string;
  description?: RichText;
}

type ReactComponentType = React.ComponentType<any>;

type CSSVariableName = string;
type HSLColor = string;
export type CssVariableNameWithDefault = Record<CSSVariableName, any>;
type VariableKey = string;
export type BorderRadiusValue = false | string;

export type ChaiBuilderThemeOptions = {
  fontFamily: false | Record<VariableKey, string>;
  borderRadius: BorderRadiusValue;
  colors:
    | false
    | {
        group: string;
        items: Record<VariableKey, [HSLColor, HSLColor]>;
      }[];
};

export type Breakpoint = {
  title: string;
  content: string;
  breakpoint: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | string;
  icon: React.ReactNode | Element;
  width: number;
};

export type SavePageData = {
  autoSave: boolean;
  blocks: ChaiBlock[];
  theme?: ChaiBuilderThemeValues;
};

type OutlineMenuItem = {
  item: React.ComponentType<{ blockId: string }>;
  tooltip: string | ReactNode;
};
type OutlineMenuItems = OutlineMenuItem[];
type TimeInSeconds = number;
export type AskAiResponse = {
  blocks?: Array<{ _id: string } & Partial<ChaiBlock>>;
  usage?: Record<any, number>;
  error?: any;
};

export type ChaiBuilderInstance = {
  setBlocks: (blocks: ChaiBlock[]) => void;
};

export type PageType = {
  key: string;
  name: string;
};

export type PageTypeItem = {
  id: string;
  name: string;
  slug?: string;
};

export type ChaiBuilderThemeValues = {
  fontFamily: Record<string, string>;
  borderRadius: string;
  colors: Record<string, string[]>;
};

export interface ChaiBuilderEditorProps {
  /**
   * RJSF Fields and Widgets
   */
  rjsfFields?: Record<string, React.ComponentType<any>>;
  rjsfWidgets?: Record<string, React.ComponentType<any>>;
  rjsfTemplates?: Record<string, React.ComponentType<any>>;
  /**
   * Optional pageId. If not provided, a random pageId will be generated
   */
  pageId?: string;
  pageExternalData?: Record<string, any>;
  themePresets?: Record<string, Partial<ChaiBuilderThemeValues>>[];
  themeOptions?: (defaultThemeOptions: ChaiBuilderThemeOptions) => ChaiBuilderThemeOptions;
  theme?: Partial<ChaiBuilderThemeValues>;
  themePanelComponent?: ReactComponentType;
  /**
   * onError callback function
   * @param error
   */
  onError?: (error: Error) => void;
  /**
   * Translations object
   */
  translations?: Record<string, Record<string, any>>;
  /**
   * onLoad callback function
   * @param editorInstance
   */
  onLoad?: (editorInstance: ChaiBuilderInstance) => void;
  /**
   * Custom layout component
   */
  layout?: React.ComponentType;
  /**
   * Layout variant. Not supported with custom layout
   */
  layoutVariant?: LayoutVariant;

  /**
   * Custom media Manager component
   */
  mediaManagerComponent?: React.ComponentType<{ onSelect: (url: string) => void }>;

  /**
   * Add blocks dialog components
   */
  addBlocksDialogTabs?: {
    key: string;
    tab: ReactComponentType;
    tabContent: ReactComponentType;
  }[];

  /**
   * HTML direction.
   */
  htmlDir?: "ltr" | "rtl";
  /**
   * Filter function for blocks to be shown in the builder
   */
  filterChaiBlock?: (block: any) => boolean;
  /**
   * Show debug logs
   */
  showDebugLogs?: boolean;
  /**
   * Auto save support
   */
  autoSaveSupport?: boolean;
  /**
   * Auto save interval in seconds
   */
  autoSaveInterval?: TimeInSeconds;
  /**
   * Breakpoints
   */
  breakpoints?: Breakpoint[];
  /**
   * Editable
   */
  editable?: boolean;

  /**
   * Loading state
   */
  loading?: boolean;

  /**
   * Locale
   */
  locale?: string;

  /**
   * Non editable component
   */
  nonEditableComponent?: ReactComponentType;

  /**
   * Canvas component. Not supported with custom layout
   */
  canvasTopBarComponents?: { right?: ReactComponentType[] };

  previewLink?: string;

  darkMode?: boolean;

  importHTMLSupport?: boolean;

  askAiCallBack?: (
    type: "styles" | "content",
    prompt: string,
    blocks: ChaiBlock[],
    lang: string,
  ) => Promise<AskAiResponse>;
  saveAiContextCallback?: (content: string) => Promise<true | Error>;
  aiContext?: string;

  uiLibraries?: Omit<UILibrary, "blocks">[];
  getUILibraryBlocks?: (library: UILibrary) => Promise<UiLibraryBlock[]>;
  getUILibraryBlock?: (library: UILibrary, uiLibBlock: UiLibraryBlock) => Promise<ChaiBlock[]>;

  getBlockAsyncProps?: (block: ChaiBlock) => Promise<string>;

  getPartialBlocks?: () => Promise<Record<string, { type: string; name: string; description?: string }>>;

  /**
   * Get all blocks of a partial block
   */
  getPartialBlockBlocks?: (partialBlockKey: string) => Promise<ChaiBlock[]>;

  /**
   * Blocks for the page
   */
  blocks?: ChaiBlock[];

  onSave?: ({ blocks, theme, autoSave }: SavePageData) => Promise<boolean | Error>;

  /**
   * onSaveStateChange callback function
   * @param syncStatus
   */
  onSaveStateChange?: (syncStatus: "UNSAVED" | "SAVED" | "SAVING") => void;

  /**
   * Preview component
   */
  previewComponent?: ReactComponentType;

  /**
   * Sidebar components. Not supported with custom layout
   */
  sideBarComponents?: {
    bottom?: ReactComponentType[];
    top?: { icon: ReactNode; label: string; component: ReactComponentType }[];
  };

  /**
   * Topbar components. Not supported with custom layout
   */
  topBarComponents?: {
    center?: ReactComponentType[];
    left?: ReactComponentType[];
    right?: ReactComponentType[];
  };

  /**
   * Outline menu items
   */
  outlineMenuItems?: OutlineMenuItems;

  _flags?: Record<string, boolean>;

  /**
   * Content locale
   */
  fallbackLang?: string;
  languages?: Array<string>;

  /**
   * Page Types props
   */
  pageTypes?: PageType[];
  searchPageTypeItems?: (pageTypeKey: string, query: string) => Promise<PageTypeItem[] | Error>;

  extraHeadTags?: ReactNode;
}

import { ChaiBlock } from "./ChaiBlock";
import React, { ReactNode } from "react";
import { LayoutVariant } from "../constants/LAYOUT_MODE.ts";
import { ChaiPage } from "./index.ts";

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

export type Breakpoint = {
  title: string;
  content: string;
  breakpoint: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | string;
  icon: React.ReactNode | Element;
  width: number;
};

type SavePageData = {
  blocks: ChaiBlock[];
  providers?: DataProvider[];
  brandingOptions?: Record<string, any>;
  themeConfiguration?: Record<string, any>;
};

type DataProvider = { providerKey: string; args: Record<string, any> };

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

export interface ChaiBuilderEditorProps {
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

  dataBindingSupport?: boolean;
  dataProviders?: DataProvider[];

  darkMode?: boolean;

  importHTMLSupport?: boolean;

  fetchMediaCallback?: (limit?: number, offset?: number) => Promise<any[]>;
  uploadMediaCallback?: (file: File) => Promise<{ url: string }>;
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

  getRSCBlock?: (block: ChaiBlock) => Promise<string>;

  /**
   * Get Global blocks
   */

  getGlobalBlocks?: () => Promise<Record<string, { name?: string; description?: string }>>;

  /**
   * Get all blocks of a global block
   */
  getGlobalBlockBlocks?: (globalBlockKey: string) => Promise<ChaiBlock[]>;

  /**
   * Blocks for the page
   */
  blocks?: ChaiBlock[];

  onSave?: ({ blocks, providers }: SavePageData) => Promise<boolean | Error>;

  brandingOptions?: Record<string, string>;
  theme?: Record<string, string>;

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

  /**
   * getPages callback function
   */
  getPages?: () => Promise<ChaiPage[]>;

  /**
   * Unsplash access key
   */
  unsplashAccessKey?: string;
  _flags?: Record<string, boolean>;

  /**
   * Content locale
   */
  fallbackLang?: string;
  languages?: Array<string>;
}

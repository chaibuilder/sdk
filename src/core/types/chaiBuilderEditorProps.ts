import { ChaiBlock } from "./ChaiBlock";
import React from "react";
import { ChaiPage, PredefinedBlock } from "./index";

interface UILibrary {
  name: string;
  uuid: string;
}

interface Block {
  type: string;
  [key: string]: any;
}

type ReactComponentType = React.ComponentType<any>;

type Breakpoint = {
  title: string;
  content: string;
  breakpoint: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  icon: React.ReactNode | Element;
  width: number;
};

export interface ChaiBuilderEditorProps {
  breakpoints?: Breakpoint[];
  blocks?: ChaiBlock[];
  editable?: boolean;
  locale?: string;
  nonEditableComponent?: ReactComponentType;
  brandingOptions?: Record<string, string>;
  canvas?: React.FC<any>;
  previewLink?: string;
  canvasTopBarComponents?: { right?: ReactComponentType[] };
  dataBindingSupport?: boolean;
  dataProviders?: { providerKey: string; args: Record<string, any> }[];
  darkMode?: boolean;
  dndOptions?: any;
  fetchMediaCallback?: (limit?: number, offset?: number) => Promise<any[]>;
  getExternalPredefinedBlock?: (
    block: PredefinedBlock,
  ) => Promise<PredefinedBlock & { blocks: ChaiBlock[]; html: string }>;
  getUILibraryBlocks?: (libraryUuid: string) => Promise<PredefinedBlock[]>;
  subPages?: Block[];
  subPagesSupport?: boolean;
  importHTML?: boolean;
  loading?: boolean;
  onSaveBlocks?: ({ blocks, providers }: any) => Promise<any>; // deprecated
  onSavePage: ({ blocks, providers }: any) => Promise<boolean>;
  onSaveBrandingOptions: (brandingOptions: any) => Promise<boolean>;
  onSyncStatusChange?: (syncStatus: "UNSAVED" | "SAVED") => void;
  previewComponent?: ReactComponentType;
  sideBarComponents?: {
    bottom?: ReactComponentType[];
    top?: { icon: ReactComponentType | string; name: string; panel: ReactComponentType }[];
  };
  topBarComponents?: {
    center?: ReactComponentType[];
    left?: ReactComponentType[];
    right?: ReactComponentType[];
  };
  uiLibraries?: UILibrary[];
  uploadMediaCallback?: (file: File) => Promise<{ url: string }>;
  getPages?: () => Promise<ChaiPage[]>;
  unsplashAccessKey?: string;
}

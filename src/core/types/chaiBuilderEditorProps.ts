import { ChaiBlock } from "./ChaiBlock";
import React, { LazyExoticComponent } from "react";
import { ChaiPage, PredefinedBlock } from "./index";

interface UiLibrary {
  name: string;
  uuid: string;
}

interface Block {
  type: string;
  [key: string]: any;
}

type ReactComponents = React.LazyExoticComponent<any> | React.FC<any>;

export interface ChaiBuilderEditorProps {
  blocks?: ChaiBlock[];
  editable?: boolean;
  nonEditableComponent?: ReactComponents;
  brandingOptions?: Record<string, string>;
  canvas?: React.FC<any>;
  previewLink?: string;
  canvasTopBarComponents?: {
    right?: React.LazyExoticComponent<any>[];
  };
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
  previewComponent?: LazyExoticComponent<any>;
  sideBarComponents?: {
    bottom?: ReactComponents[];
    top?: { icon: React.FC<any> | string; name: string; panel: ReactComponents }[];
  };
  topBarComponents?: {
    center?: ReactComponents[];
    left?: ReactComponents[];
    right?: ReactComponents[];
  };
  uiLibraries?: UiLibrary[];
  uploadMediaCallback?: (file: File) => Promise<{ url: string }>;
  getPages?: () => Promise<ChaiPage[]>;
  unsplashAccessKey?: string;
}

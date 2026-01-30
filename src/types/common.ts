import { RealtimeAdapter } from "@/pages";
import { LoggedInUser } from "@/pages/types/loggedin-user";
import type { RJSFSchema, UiSchema } from "@rjsf/utils";
import { ChaiBuilderEditorProps } from "./chaibuilder-editor-props";

type ChaiBlock<T = Record<string, any>> = {
  _id: string;
  _name?: string;
  _parent?: string | null | undefined;
  _libBlock?: string;
  _type: string;
  partialBlockId?: string;
} & T;

export interface ChaiCoreBlock {
  blocks?: ChaiBlock[];
  data: any;
  props: { [key: string]: any };
  type: string;
  _name?: string;
  partialBlockId?: string;
}

export type { ChaiBlock };
export type ChaiBlockUiSchema = UiSchema;
export type ChaiBlockPropsSchema = RJSFSchema & {
  properties?:
    | {
        [key: string]: RJSFSchema;
      }
    | undefined;
  enumNames?: (string | number)[];
};
export type ChaiBlockSchema = {
  properties?: Record<string, ChaiBlockPropsSchema>;
  allOf?: any[];
  oneOf?: any[];
} & Partial<Pick<ChaiBlockPropsSchema, "required" | "dependencies" | "ui" | "title" | "description" | "default">>;

export type ChaiBlockSchemas = {
  schema: object | Omit<ChaiBlockSchema, "ui">;
  uiSchema?: ChaiBlockUiSchema;
};
export type ChaiBlockRJSFSchemas = {
  schema: object | Omit<ChaiBlockSchema, "ui">;
  uiSchema: ChaiBlockUiSchema;
};
export type ChaiWebsiteBuilderProps = {
  hasReactQueryProvider?: boolean;
  topLeftCorner?: React.FC;
  apiUrl?: string;
  getPreviewUrl?: (slug: string) => string;
  getLiveUrl?: (slug: string) => string;
  onLogout?: () => void;
  getAccessToken?: () => Promise<string>;
  currentUser: LoggedInUser | null;
  websocket?: any;
  features?: { sharedJsonLD?: boolean; canResetSeoToDefault?: boolean } & Record<string, boolean>;
  realtimeAdapter?: RealtimeAdapter;
} & Pick<
  ChaiBuilderEditorProps,
  | "onError"
  | "translations"
  | "locale"
  | "htmlDir"
  | "autoSave"
  | "autoSaveActionsCount"
  | "fallbackLang"
  | "languages"
  | "themePresets"
  | "flags"
  | "structureRules"
>;

export type ChaiPageProps<T = Record<string, any>> = {
  slug: string;
  searchParams?: Record<string, string>;
} & T;

export type ChaiFontViaUrl = {
  family: string;
  url: string;
  fallback: string;
};

export type ChaiFontViaSrc = {
  family: string;
  src: {
    url: string;
    format: string;
    fontWeight?: string;
    fontStyle?: string;
    fontDisplay?: string;
    fontStretch?: string;
  }[];
  fallback: string;
};

export type ChaiFont = ChaiFontViaUrl | ChaiFontViaSrc;

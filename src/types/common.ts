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
export type ChaiBlockPropSchema = RJSFSchema & {
  ui?: ChaiBlockUiSchema;
  default: any;
};
export type ChaiBlockSchema = {
  properties?: Record<string, ChaiBlockPropSchema>;
  allOf?: any[];
  oneOf?: any[];
} & Partial<Pick<ChaiBlockPropSchema, "required" | "dependencies" | "ui" | "title" | "description" | "default">>;
export type ChaiBlockSchemas = {
  schema: object | Omit<ChaiBlockSchema, "ui">;
  uiSchema?: ChaiBlockUiSchema;
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

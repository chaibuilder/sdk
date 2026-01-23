import { StreamTextResult } from "ai";
import ChaiActionsRegistry from "./builder/actions-registery";
import { getAskAiSystemPrompt } from "./classes/system-prompt";

export interface ChaiLoggedInUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export type ChaiUserInfo = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
};

export type ChaiAsset = {
  id: string;
  name: string;
  url: string;
  type: string;
  createdAt: string;
  updatedAt?: string;
  createdBy: string;
  size?: number;
  folderId: string | null;

  // Optional
  thumbnailUrl?: string;
  description?: string;
  duration?: number;
  format?: string;

  width?: number;
  height?: number;
};

export type AssetsParams = {
  search: string;
  limit: number;
  page: number;
};

export type AIChatOptions = {
  messages: any[];
  image?: string;
  systemPrompt?: string;
  initiator?: string | null;
  model?: string;
};

export interface ChaiBuilderPagesAIInterface {
  handleRequest(options: AIChatOptions, res: any): Promise<StreamTextResult<any, any>>;
  isConfigured(): boolean;
}

export * from "../types/actions";
export { initChaiBuilderActionHandler } from "./builder/chai-builder-actions-handler";
export { db, safeQuery, schema } from "./db";
export { LANGUAGES } from "./LANGUAGES";
export { ChaiActionsRegistry, getAskAiSystemPrompt };

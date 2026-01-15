"use server";

import { StreamTextResult } from "ai";
import ChaiActionsRegistry from "./actions/actions-registery";
import { getAskAiSystemPrompt } from "./classes/system-prompt";
import { registerChaiGlobalDataProvider } from "./register/register-global-data-provider";
import { getChaiPageType, getChaiPageTypes, registerChaiPageType } from "./register/register-page-type";
import { registerChaiPartialType } from "./register/register-partial-type";
import { getChaiCollection, getChaiCollections, registerChaiCollection } from "./register/regsiter-collection";
import { getChaiGlobalData } from "./register/register-global-data-provider";

export interface LoggedInUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export type ChaiBuilderUserInfo = {
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

export { initChaiBuilderActionHandler } from "./actions/chai-builder-actions-handler";
export { db, safeQuery, schema } from "./db";
export { LANGUAGES } from "./LANGUAGES";
export * from "./types";
export {
  ChaiActionsRegistry,
  getChaiGlobalData,
  getAskAiSystemPrompt,
  getChaiCollection,
  getChaiCollections,
  getChaiPageType,
  getChaiPageTypes,
  registerChaiCollection,
  registerChaiGlobalDataProvider,
  registerChaiPageType,
  registerChaiPartialType,
};

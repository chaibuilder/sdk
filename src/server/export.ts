"use server";

import { ChaiBlock } from "@chaibuilder/runtime";
import { StreamTextResult } from "ai";
import { getAskAiSystemPrompt } from "./classes/system-prompt";
import { registerChaiGlobalDataProvider } from "./register/register-global-data-provider";
import { getChaiPageType, getChaiPageTypes, registerChaiPageType } from "./register/register-page-type";
import { registerChaiPartialType } from "./register/register-partial-type";
import { getChaiCollection, getChaiCollections, registerChaiCollection } from "./register/regsiter-collection";

export const API_URL = "https://api.chaibuilder.com";

export interface LoggedInUser {
  accessToken: string;
  refreshToken: string;
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export declare interface ChaiBuilderPagesInterface {
  setFallbackLang(lang: string): void;
  getFallbackLang(): string;
  setDraftMode(draft: boolean): void;
  isDraftMode(): boolean;
  handle(body: any, authToken: string, response?: any): Promise<any>;
  emit(action: string, data: any): void;
  getPageBySlug(slug: string): Promise<any>;
  getFullPage(id: string): Promise<any>;
  getSiteSettings(): Promise<any>;

  resolveLink(pageTypeKey: string, id: string, lang: string): Promise<string>;
  resolvePageLink(href: string, lang: string): Promise<string>;
  getPageData({
    blocks,
    pageType,
    pageProps,
    lang,
  }: {
    blocks?: ChaiBlock[];
    pageType: string;
    pageProps: any;
    lang: string;
  }): Promise<any>;
  getGlobalData(lang: string): Promise<any>;
}

export type ChaiBuilderUserInfo = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
};

export interface ChaiBuilderPagesUsersInterface {
  login({ email, password }: { email: string; password: string }): Promise<LoggedInUser | { error: string }>;
  logout(): Promise<void>;
  isUserActive(authToken: string): Promise<boolean>;
  getUserRoleAndPermissions(authToken: string): Promise<{
    role: string;
    permissions: string[] | null;
  }>;
  getUserInfo(authToken: string, data: { userId: string }): Promise<ChaiBuilderUserInfo>;
  refreshToken(data: { accessToken: string; refreshToken: string }): Promise<LoggedInUser | { error: string }>;
}

export interface ChaiBuilderPagesBackendInterface {
  handleAction(body: any, authToken?: string): Promise<any>;
  handleUsersAction?(body: any, authToken?: string): Promise<any>;
  handleAssetsAction?(body: any, authToken?: string): Promise<any>;
}

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

export interface ChaiBuilderPagesAssetsInterface {
  upload(
    {
      file,
      folderId,
      name,
      optimize,
    }: {
      name: string;
      file: Base64URLString;
      folderId?: string | null;
      optimize?: boolean;
    },
    authToken: string,
  ): Promise<ChaiAsset | { error: string }>;

  getAsset({ id }: { id: string }, authToken: string): Promise<ChaiAsset | { error: string }>;

  getAssets(
    params: AssetsParams,
    authToken: string,
  ): Promise<
    | {
        assets: Partial<ChaiAsset>[];
        total: number;
        page: number;
        pageSize: number;
      }
    | { error: string }
  >;

  deleteAsset({ id }: { id: string }, authToken: string): Promise<{ success: boolean } | { error: string }>;

  updateAsset(
    {
      id,
      file,
      description,
    }: {
      id: string;
      file?: Base64URLString;
      description?: string;
    },
    authToken: string,
  ): Promise<ChaiAsset | { error: string }>;
}

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

export { ChaiAIChatHandler } from "./classes/class-ai-chat-handler";
export { ChaiBuilderPages } from "./classes/class-chaibuilder-pages";
export type { ChaiBuilderPagesOptions } from "./classes/class-chaibuilder-pages";
export { ChaiBuilderPagesBackend } from "./classes/class-chaibuilder-pages-backend";
export { ChaiBuilderPagesUsers as ChaiBuilderPagesUserManagement } from "./classes/class-chaibuilder-pages-users";
export { LANGUAGES } from "./LANGUAGES";
export * from "./types";
export {
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

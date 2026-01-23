import { ChaiBlock, ChaiPageProps } from "@/types/common";
import { ChaiTheme } from "./chaibuilder-editor-props";
import { ChaiDesignTokens } from "./types";

export type ChaiWebsiteSetting = {
  appKey: string;
  fallbackLang: string;
  languages: string[];
  theme: ChaiTheme;
  designTokens: ChaiDesignTokens;
};

type ChaiPageSeo = {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  jsonLD?: string;
};

export type ChaiPage = {
  id: string;
  slug: string;
  lang: string;
  name: string;
  pageType: string;
  blocks: ChaiBlock[];
  createdAt: string;
  lastSaved: string;
  dynamic: boolean;
  online: boolean;
  seo: ChaiPageSeo;
  app: string;
  primaryPage?: string;
  currentEditor?: string;
  changes: object[];
  parent?: string;
  libRefId?: string;
  dynamicSlugCustom?: string;
  metadata?: object;
  jsonld?: object;
  globalJsonLds?: string[];
  links?: string;
  partialBlocks?: string;
  designTokens?: ChaiDesignTokens;
};

export type ChaiPageType = {
  key: string;
  helpText?: string;
  icon?: string;
  hasSlug?: boolean;
  name: string | (() => Promise<string>);
  dynamicSegments?: string;
  dynamicSlug?: string;
  getDynamicPages?: ({
    query,
    uuid,
  }: {
    query?: string;
    uuid?: string;
  }) => Promise<Pick<ChaiPage, "id" | "name" | "slug" | "primaryPage">[]>;
  search?: (query: string) => Promise<Pick<ChaiPage, "id" | "name" | "slug">[] | Error>;
  resolveLink?: (id: string, draft?: boolean, lang?: string) => Promise<string>;
  onCreate?: (data: Partial<ChaiPage> & { id: string }) => Promise<void>;
  onUpdate?: (data: Partial<ChaiPage> & { id: string }) => Promise<void>;
  onDelete?: (data: Pick<ChaiPage, "id">) => Promise<void>;

  // page data
  dataProvider?: (args: {
    lang: string;
    draft: boolean;
    inBuilder: boolean;
    pageProps: ChaiPageProps;
  }) => Promise<Record<string, any>>;

  //extra options
  defaultSeo?: () => Record<string, any>;
  defaultJSONLD?: () => Record<string, any>;
  defaultMetaTags?: () => Record<string, string>;
};

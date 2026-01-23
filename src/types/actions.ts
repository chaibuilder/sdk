import { ChaiBlock, ChaiPageProps } from "@/types/common";
import { ChaiTheme } from "./chaibuilder-editor-props";
import { ChaiDesignTokens } from "./types";

export type PageTypeSearchResult = {
  id: string;
  name: string;
  slug?: string;
};

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
  languagePageId: string;
  blocks: ChaiBlock[];
  fallbackLang: string;
  createdAt: string;
  lastSaved: string;
  dynamic: boolean;
  seo?: ChaiPageSeo;
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
  }) => Promise<Pick<ChaiPage, "id" | "name" | "slug">[]>;
  search?: (query: string) => Promise<PageTypeSearchResult[] | Error>;
  resolveLink?: (id: string, draft?: boolean, lang?: string) => Promise<string>;
  onCreate?: (data: Omit<ChaiPage, "seo">) => Promise<void>;
  onUpdate?: (data: ChaiPage) => Promise<void>;
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

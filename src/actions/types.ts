import { ChaiPageProps } from "@/runtime/index";

export type PageTypeSearchResult = {
  id: string;
  name: string;
  slug?: string;
};

export type DesignTokens = {
  [token: string]: {
    value: string;
    name: string;
  };
};

export type ChaiWebsiteSetting = {
  appKey: string;
  fallbackLang: string;
  languages: string[];
  theme: Record<"fontFamily" | "borderRadius" | "colors", any>;
  designTokens: DesignTokens;
};

export type ChaiBuilderPage = {
  id: string;
  slug: string;
  name: string;
  lang: string;
  online: boolean;
  seo: Record<string, any>;
};

export type ChaiDynamicPage = {
  id: string;
  slug: string;
  name: string;
  primaryPage?: string;
};

export type ChaiBuilderPageType = {
  key: string;
  helpText?: string;
  icon?: string;
  hasSlug?: boolean;
  name: string | (() => Promise<string>);
  dynamicSegments?: string;
  dynamicSlug?: string;
  getDynamicPages?: ({ query, uuid }: { query?: string; uuid?: string }) => Promise<ChaiDynamicPage[]>;
  search?: (query: string) => Promise<PageTypeSearchResult[] | Error>;
  resolveLink?: (id: string, draft?: boolean, lang?: string) => Promise<string>;
  onCreate?: (data: Omit<ChaiBuilderPage, "seo">) => Promise<void>;
  onUpdate?: (data: ChaiBuilderPage) => Promise<void>;
  onDelete?: (data: Pick<ChaiBuilderPage, "id">) => Promise<void>;

  // page data
  dataProvider?: (args: {
    lang: string;
    draft: boolean;
    inBuilder: boolean;
    pageProps: ChaiPageProps;
  }) => Promise<Record<string, any>>;

  //extra options
  defaultTrackingInfo?: () => Record<string, any>;
  defaultSeo?: () => Record<string, any>;
  defaultJSONLD?: () => Record<string, any>;
  defaultMetaTags?: () => Record<string, string>;
};

export type { ChaiPageProps };

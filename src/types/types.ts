import * as React from "react";

export type ChaiRenderBlockProps<T> = {
  blockProps: Record<string, string>;
  children?: React.ReactNode;
  inBuilder: boolean;
} & T;

export type ChaiBlockStyles = Record<string, string>;

export type {
  ChaiTheme as ChaiBuilderThemeValues,
  ChaiSavePageData as SavePageData,
} from "@/types/chaibuilder-editor-props";

export interface ChaiDesignTokens {
  [uniqueId: string]: {
    name: string;
    value: string;
  };
}

type ChaiBlocksWithDesignTokens = Record<string, string>;
export interface ChaiSiteWideUsageData {
  [pageId: string]: {
    name: string;
    isPartial: boolean;
    partialBlocks: string[];
    links: string[];
    designTokens: ChaiBlocksWithDesignTokens; // { blockId: Name, blockId: name 2}
  };
}

export interface Website {
  name: string;
  createdAt: string;
  fallbackLang?: string;
  languages?: string[];
  settings: any;
}

export type WebsiteSettings = {
  name: string;
  createdAt: string;
  settings: Partial<{
    email: string;
    phone: string;
    address: string;
    logo: { url: string; id: string };
    language: string;
    siteName: string;
    termsURL: string;
    timezone: string;
    favicon: { url: string; id: string };
    metaPixelId: string;
    tiktokPixelId: string;
    linkedinInsightId: string;
    microsoftUetId: string;
    xPixelId: string;
    siteTagline: string;
    socialLinks: Record<string, string>;
    contactEmail: string;
    contactPhone: string;
    contactAddress: string;
    privacyPolicyURL: string;
    recaptchaSiteKey: string;
    googleAnalyticsId: string;
    googleTagManagerId: string;
    recaptchaSecretKey: string;
    darkMode: boolean;
    headHTML: string;
    footerHTML: string;
  }>;
  languages: string[];
  fallbackLang: string;
};

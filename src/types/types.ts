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

export interface Site {
  id: string;
  name: string;
  createdAt: string;
  fallbackLang?: string;
  languages?: string[];
  apiKey?: string;
  domain?: string;
  subdomain?: string;
  hosting?: string;
  domainConfigured: boolean;
  settings: any;
}

export type SiteData = {
  id: string;
  name: string;
  createdAt: string;
  settings: {
    email: string;
    phone: string;
    address: string;
    logoURL: string;
    language: string;
    siteName: string;
    termsURL: string;
    timezone: string;
    faviconURL: string;
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
    cookieConsentEnabled: boolean;
    darkMode?: boolean;
    cookieConsentSettings?: {
      consentModal: {
        layout: "box" | "box wide" | "box inline" | "cloud" | "cloud inline" | "bar" | "bar inline";
        position:
          | "top"
          | "bottom"
          | "top left"
          | "top center"
          | "top right"
          | "middle left"
          | "middle center"
          | "middle right"
          | "bottom left"
          | "bottom center"
          | "bottom right";
        equalWeightButtons: boolean;
        flipButtons: boolean;
      };
      preferencesModal: {
        layout: "box" | "bar";
        position: "left" | "right";
        equalWeightButtons: boolean;
        flipButtons: boolean;
      };
    };
    customTrackingScripts: string[];
    headHTML?: string;
    footerHTML?: string;
  };
  languages: string[];
  fallbackLang: string;
  domainConfigured: boolean;
  domain: string;
  subdomain: string;
  hosting: string;
};

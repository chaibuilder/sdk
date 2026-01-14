import { ChaiBlock, ChaiPageProps } from "@chaibuilder/runtime";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { applyChaiDataBinding } from "@chaibuilder/sdk/render";
import * as utils from "./utils";
import type { ChaiBuilderPage } from "./utils";

class ChaiBuilder {
  private static appId?: string;
  private static draftMode: boolean = false;
  private static fallbackLang: string = "en";

  static verifyInit() {}

  static init = async (appId: string, draftMode: boolean = false) => {
    if (!appId) {
      throw new Error("Please initialize ChaiBuilder with an API key");
    }
    ChaiBuilder.appId = appId;
    await ChaiBuilder.loadSiteSettings(draftMode);
  };

  static getAppId() {
    return ChaiBuilder.appId;
  }

  static setAppId(appId: string) {
    ChaiBuilder.appId = appId;
  }

  static async loadSiteSettings(draftMode: boolean) {
    ChaiBuilder.verifyInit();
    const siteSettings = await ChaiBuilder.getSiteSettings();

    ChaiBuilder?.setFallbackLang(siteSettings?.fallbackLang || "en");
    ChaiBuilder?.setDraftMode(draftMode);
  }

  static setDraftMode(draftMode: boolean) {
    ChaiBuilder.verifyInit();
    ChaiBuilder.draftMode = draftMode;
  }

  static setFallbackLang(lang: string) {
    ChaiBuilder.verifyInit();
    ChaiBuilder.fallbackLang = lang;
  }

  static getFallbackLang() {
    ChaiBuilder.verifyInit();
    return ChaiBuilder.fallbackLang;
  }

  static async getSiteSettings(): Promise<{ fallbackLang?: string; [key: string]: unknown }> {
    ChaiBuilder.verifyInit();
    return await unstable_cache(
      async () => await utils.getSiteSettings(ChaiBuilder.appId!, ChaiBuilder.draftMode),
      [`website-settings-${ChaiBuilder.getAppId()}`],
      {
        tags: [`website-settings`, `website-settings-${ChaiBuilder.getAppId()}`],
      },
    )();
  }

  static async getPageBySlug(slug: string): Promise<ChaiBuilderPage | { error: string }> {
    ChaiBuilder.verifyInit();
    return await utils.getPageBySlug(slug, this.appId!, this.draftMode);
  }

  static async getFullPage(pageId: string): Promise<Record<string, unknown>> {
    ChaiBuilder.verifyInit();
    return await utils.getFullPage(pageId, this.appId!, this.draftMode);
  }

  static async getPartialPageBySlug(slug: string): Promise<Record<string, unknown>> {
    ChaiBuilder.verifyInit();
    // if the slug is of format /_partial/{langcode}/{uuid}, get the uuid. langcode is optional
    const uuid = slug.split("/").pop();
    if (!uuid) {
      throw new Error("Invalid slug format for partial page");
    }

    // Fetch the partial page data
    const siteSettings = await ChaiBuilder.getSiteSettings();
    const data = await ChaiBuilder.getFullPage(uuid);
    const fallbackLang = siteSettings?.fallbackLang;
    const lang = slug.split("/").length > 3 ? slug.split("/")[2] : fallbackLang;
    return { ...data, fallbackLang, lang };
  }

  static getPage = cache(async (slug: string): Promise<ChaiBuilderPage | Record<string, unknown>> => {
    ChaiBuilder.verifyInit();
    if (slug.startsWith("/_partial/")) {
      return await ChaiBuilder.getPartialPageBySlug(slug);
    }
    const page: ChaiBuilderPage = await ChaiBuilder.getPageBySlug(slug);
    if ("error" in page) {
      return page;
    }

    const siteSettings = await ChaiBuilder.getSiteSettings();
    const tagPageId = page.id;
    const languagePageId = page.languagePageId || page.id;
    return await unstable_cache(
      async () => {
        const data = await ChaiBuilder.getFullPage(languagePageId);
        const fallbackLang = siteSettings?.fallbackLang;
        return { ...data, fallbackLang, lang: page.lang || fallbackLang };
      },
      ["page-" + languagePageId, page.lang, page.id, slug],
      { tags: ["page-" + tagPageId] },
    )();
  });

  static async getPageSeoData(slug: string) {
    ChaiBuilder.verifyInit();
    if (slug.startsWith("/_partial/")) {
      return {
        title: "Partial Page",
        description: "This is a partial page.",
        robots: {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        },
      };
    }
    const page = await ChaiBuilder.getPage(slug);
    if ("error" in page) {
      return {
        title: "Page Not Found",
        description: "The requested page could not be found.",
        robots: { index: false, follow: false },
      };
    }

    // Type assertion after error check
    const pageData = page as Exclude<ChaiBuilderPage, { error: string }>;

    const externalData = await ChaiBuilder.getPageExternalData({
      blocks: pageData.blocks,
      pageProps: pageData,
      pageType: pageData.pageType,
      lang: pageData.lang,
    });

    const seo = applyChaiDataBinding(pageData?.seo ?? {}, externalData);

    return {
      title: seo?.title,
      description: seo?.description,
      openGraph: {
        title: seo?.ogTitle || seo?.title,
        description: seo?.ogDescription || seo?.description,
        images: seo?.ogImage ? [seo?.ogImage] : [],
      },
      alternates: {
        canonical: seo?.canonicalUrl || "",
      },
      robots: {
        index: !seo?.noIndex,
        follow: !seo?.noFollow,
        googleBot: {
          index: !seo?.noIndex,
          follow: !seo?.noFollow,
        },
      },
    };
  }

  static async getPageExternalData(args: {
    blocks: ChaiBlock[];
    pageProps: ChaiPageProps;
    pageType: string;
    lang: string;
  }) {
    ChaiBuilder.verifyInit();
    return await ChaiBuilder.getPageData(args);
  }

  static async getPageStyles(blocks: ChaiBlock[]) {
    ChaiBuilder.verifyInit();
    return await utils.getPageStyles(blocks);
  }

  static resolvePageLink = cache(async (href: string, lang: string): Promise<string> => {
    ChaiBuilder.verifyInit();
    return await ChaiBuilder.resolveLinks(href, lang);
  });

  static async getPageData(args: {
    blocks: ChaiBlock[];
    pageProps: Record<string, unknown>;
    pageType: string;
    lang: string;
  }): Promise<Record<string, unknown>> {
    return await utils.getPageData({ ...args, draftMode: this.draftMode });
  }

  static async getBlocksStyles(blocks: ChaiBlock[]): Promise<string> {
    return await utils.getBlocksStyles(blocks);
  }

  static async resolveLinks(href: string, lang: string): Promise<string> {
    return await utils.resolveLinks(href, lang, this.appId!, this.draftMode, this.fallbackLang);
  }
}

export { ChaiBuilder };

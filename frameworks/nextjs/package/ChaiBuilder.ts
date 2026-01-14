import { ChaiBlock } from "@chaibuilder/runtime";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { getPageStyles } from "./get-page-styles";

//TODO: https://github.com/chaibuilder/frameworks/blob/main/packages/next/src/blocks/rsc/render-chai-blocks.tsx

type ChaiBuilderPage =
  | {
      id: string;
      slug: string;
      lang: string;
      name: string;
      pageType: string;
      languagePageId: string;
      blocks: ChaiBlock[];
    }
  | { error: string };

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

    ChaiBuilder?.setFallbackLang(siteSettings?.fallbackLang);
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

  static async getSiteSettings() {
    ChaiBuilder.verifyInit();
    return await unstable_cache(async () => /* TODO: implement */ {}, [`website-settings-${ChaiBuilder.getAppId()}`], {
      tags: [`website-settings`, `website-settings-${ChaiBuilder.getAppId()}`],
    })();
  }

  static async getPartialPageBySlug(slug: string) {
    ChaiBuilder.verifyInit();
    // if the slug is of format /_partial/{langcode}/{uuid}, get the uuid. langcode is optional
    const uuid = slug.split("/").pop();
    if (!uuid) {
      throw new Error("Invalid slug format for partial page");
    }

    // Fetch the partial page data
    const siteSettings = await ChaiBuilder.getSiteSettings();
    const data = await ChaiBuilder.getFullPage(uuid); //TODO: Replace by ORM https://github.com/chaibuilder/frameworks/blob/main/packages/next/src/server/builder-api/src/ChaiBuilderPages.ts#L843
    const fallbackLang = siteSettings?.fallbackLang;
    const lang = slug.split("/").length > 3 ? slug.split("/")[2] : fallbackLang;
    return { ...data, fallbackLang, lang };
  }

  static getPage = cache(async (slug: string) => {
    ChaiBuilder.verifyInit();
    if (slug.startsWith("/_partial/")) {
      return await ChaiBuilder.getPartialPageBySlug(slug);
    }
    const page: ChaiBuilderPage = await ChaiBuilder.getPageBySlug(slug); //TODO: Replace by ORM https://github.com/chaibuilder/frameworks/blob/main/packages/next/src/server/builder-api/src/ChaiBuilderPages.ts#L686
    if ("error" in page) {
      return page;
    }

    const siteSettings = await ChaiBuilder.getSiteSettings();
    const tagPageId = page.id;
    return await unstable_cache(
      async () => {
        const data = await ChaiBuilder.pages?.getFullPage(page.languagePageId);
        const fallbackLang = siteSettings?.fallbackLang;
        return { ...data, fallbackLang, lang: page.lang || fallbackLang };
      },
      ["page-" + page.languagePageId, page.lang, page.id, slug],
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

    const externalData = await ChaiBuilder.getPageExternalData({
      blocks: page.blocks,
      pageProps: page,
      pageType: page.pageType,
      lang: page.lang,
    });

    const seo = withDataBinding(page?.seo ?? {}, externalData);

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
    return await ChaiBuilder.getPageData(args); //TODO: Replace by orm
  }

  static async getPageStyles(blocks: ChaiBlock[]) {
    ChaiBuilder.verifyInit();
    return await getPageStyles(blocks);
  }

  static resolvePageLink = cache(async (href: string, lang: string) => {
    ChaiBuilder.verifyInit();
    return await ChaiBuilder?.resolvePageLink(href, lang); //TODO: Replace by orm
  });
}

export { ChaiBuilder };

import { db, safeQuery, schema } from "@chaibuilder/sdk/server";
import { error } from "console";
import { and, eq } from "drizzle-orm";

class ChaiBuilder {
  public static draftMode: boolean = false;
  public static fallbackLang: string = "en";
  public static appId: string = "";

  public static setDraftMode(mode: boolean) {
    this.draftMode = mode;
  }

  public static setFallbackLang(lang: string) {
    this.fallbackLang = lang;
  }

  public static initialise(appId: string, draftMode: boolean = false) {
    this.appId = appId;
    this.draftMode = draftMode;
    this.getSiteSettings();
  }

  public static async getSiteSettings() {
    const table = this.draftMode ? db.query.apps : db.query.appsOnline;
    const { data: website } = await safeQuery(() =>
      table.findFirst({
        where: and(eq(schema.apps.id, this.appId)),
      }),
    );
    if (error) {
      throw error;
    }
    this.setFallbackLang(website.fallbackLang);
    return website;
  }

  public static async getPageBySlug(slug: string): Promise<Record<string, unknown>> {
    //TODO: GetPageBySlug(slug: string)
    return {};
  }

  public static async getFullPage(pageId: string): Promise<Record<string, unknown>> {
    //TODO: GetFullPage(pageId: string)
    return {};
  }

  public static async getBlocksStyles(blocks: ChaiBlock[]): Promise<string> {
    //TODO: GetBlocksStyles(blocks: ChaiBlock[])
    return "";
  }

  public static async getPageExternalData(args: {
    blocks: ChaiBlock[];
    pageProps: Record<string, any>;
    pageType: string;
    lang: string;
  }): Promise<Record<string, unknown>> {
    //TODO: GetPageExternalData({ blocks: ChaiBlock[], pageProps: Record<string, any>, pageType: string, lang: string })
    return {};
  }

  public static async resolveLinks(args: { blocks: ChaiBlock[] }): Promise<Partial<ChaiBlock>[]> {
    //TODO: GetResolveLinks(blocks: ChaiBlock[])
    return [];
  }
}

export { ChaiBuilder };

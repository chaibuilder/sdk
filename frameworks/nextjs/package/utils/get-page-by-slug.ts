import { ChaiBlock } from "@chaibuilder/runtime";
import { db, safeQuery, schema } from "@chaibuilder/sdk/server";
import { and, eq } from "drizzle-orm";

export type ChaiBuilderPage =
  | {
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
      seo?: {
        title?: string;
        description?: string;
        ogTitle?: string;
        ogDescription?: string;
        ogImage?: string;
        canonicalUrl?: string;
        noIndex?: boolean;
        noFollow?: boolean;
        jsonLD?: string;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    }
  | { error: string };

export async function getPageBySlug(slug: string, appId: string, draftMode: boolean): Promise<ChaiBuilderPage> {
  const table = draftMode ? db.query.appPages : db.query.appPagesOnline;
  const { data: page, error } = await safeQuery(() =>
    table.findFirst({
      where: and(eq(schema.appPages.app, appId), eq(schema.appPages.slug, slug)),
    }),
  );

  if (error) {
    return { error: (error as Error).message || "Unknown error" };
  }
  if (!page) {
    return { error: "Page not found" };
  }
  return page as ChaiBuilderPage;
}

import { and, eq, or, like } from "drizzle-orm";
import { get, isEmpty, keys, reverse, sortBy, take } from "lodash";
import { ChaiBlock } from "@chaibuilder/sdk/runtime";
import { db, safeQuery, schema } from "@chaibuilder/sdk/server";
import { getFullPage } from "./get-full-page";

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

export async function getPageBySlug(
  slug: string,
  appId: string,
  draftMode: boolean,
  dynamicSegments: Record<string, string> = {},
): Promise<ChaiBuilderPage> {
  const table = draftMode ? db.query.appPages : db.query.appPagesOnline;
  const schemaTable = draftMode ? schema.appPages : schema.appPagesOnline;

  // Step 1: Check for direct slug match (static pages)
  const { data: staticPage } = await safeQuery(() =>
    table.findFirst({
      where: and(eq(schemaTable.app, appId), eq(schemaTable.slug, slug), eq(schemaTable.dynamic, false)),
      columns: {
        id: true,
        slug: true,
        lang: true,
        primaryPage: true,
        name: true,
        pageType: true,
      },
    }),
  );

  if (staticPage) {
    const pageId = staticPage.primaryPage ?? staticPage.id;
    const fullPage = await getFullPage(pageId, appId, draftMode);
    return {
      ...fullPage,
      fallbackLang: fullPage.lang, // Use lang as fallbackLang
      createdAt: fullPage.lastSaved ?? new Date().toISOString(),
      pageType: fullPage.pageType ?? "",
    } as ChaiBuilderPage;
  }

  // Step 2: Handle dynamic routing
  // Extract segments from slug: /blog/post-1 -> segment1: /blog/, segment2: /blog/post-1/
  const strippedSlug = slug.slice(1);
  const segment1 = `/${take(strippedSlug.split("/"), 1).join("/")}`;
  const segment2 = `/${take(strippedSlug.split("/"), 2).join("/")}`;

  // Get all dynamic pages that match segments
  const { data: dynamicPages } = await safeQuery(() =>
    table.findMany({
      where: and(
        eq(schemaTable.app, appId),
        eq(schemaTable.dynamic, true),
        or(like(schemaTable.slug, `%${segment1}%`), like(schemaTable.slug, `%${segment2}%`)),
      ),
      columns: {
        id: true,
        slug: true,
        lang: true,
        primaryPage: true,
        name: true,
        pageType: true,
        dynamicSlugCustom: true,
      },
    }),
  );

  if (!dynamicPages || dynamicPages.length === 0) {
    return { error: "Page not found" };
  }

  // Step 3: Sort pages by slug complexity (more segments = higher priority)
  const sortedPages = reverse(sortBy(dynamicPages, (page) => page.slug.split("/").length));

  // Step 4: Sort by dynamicSegments keys order if provided
  const dynamicKeys = keys(dynamicSegments);
  if (dynamicKeys.length > 0) {
    sortedPages.sort((a, b) => {
      const aIndex = dynamicKeys.indexOf(a.pageType || "");
      const bIndex = dynamicKeys.indexOf(b.pageType || "");
      // If not found, put at the end
      const aOrder = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
      const bOrder = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
      return aOrder - bOrder;
    });
  }

  // Step 5: Try to match slug with dynamic page patterns
  for (const page of sortedPages) {
    if (isEmpty(page.slug)) {
      continue;
    }

    const pageType = page.pageType || "";
    const regex = get(dynamicSegments, pageType, "");
    const customSlug = page.dynamicSlugCustom || "";

    // Build regex pattern: pageSlug + dynamicSegment regex + custom regex
    const pattern = page.slug + regex + customSlug;
    const reg = new RegExp(pattern);
    const match = slug.match(reg);

    if (match && match[0] === slug) {
      const pageId = page.primaryPage ?? page.id;
      const fullPage = await getFullPage(pageId, appId, draftMode);
      return {
        ...fullPage,
        slug, // Use the actual matched slug
        fallbackLang: fullPage.lang, // Use lang as fallbackLang
        createdAt: fullPage.lastSaved ?? new Date().toISOString(),
        pageType: fullPage.pageType ?? "",
      } as ChaiBuilderPage;
    }
  }

  return { error: "Page not found" };
}

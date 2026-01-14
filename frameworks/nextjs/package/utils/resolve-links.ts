import { db, getChaiPageType, safeQuery, schema } from "@chaibuilder/sdk/server";
import { and, eq } from "drizzle-orm";
import { startsWith } from "lodash";

export async function resolveLinks(
  href: string,
  lang: string,
  appId: string,
  draftMode: boolean,
  fallbackLang: string
): Promise<string> {
  // href is of format "pageType:${pageTypeKey}:${id}"
  if (!startsWith(href, "pageType:")) {
    return href;
  }

  const pageTypeKey = href.split(":")[1];
  const id = href.split(":")[2];
  const pageType = getChaiPageType(pageTypeKey);

  if (!pageType) {
    return href;
  }

  if (pageType.resolveLink) {
    return await pageType.resolveLink(id, draftMode, lang);
  }

  const table = draftMode ? db.query.appPages : db.query.appPagesOnline;
  const { data: page } = await safeQuery(() =>
    table.findFirst({
      where: and(eq(schema.appPages.app, appId), eq(schema.appPages.id, id)),
    }),
  );

  if (!page) {
    return "/not-found";
  }

  // Handle language prefix
  const langPrefix = lang === fallbackLang || !lang ? "" : `/${lang}`;
  return `${langPrefix}/${page.slug}`;
}

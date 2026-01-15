import { db, safeQuery, schema } from "@chaibuilder/sdk/server";
import { and, eq } from "drizzle-orm";

export async function getFullPage(
  pageId: string,
  appId: string,
  draftMode: boolean
): Promise<Record<string, unknown>> {
  const table = draftMode ? db.query.appPages : db.query.appPagesOnline;
  const { data: page, error } = await safeQuery(() =>
    table.findFirst({
      where: and(eq(schema.appPages.app, appId), eq(schema.appPages.id, pageId)),
    }),
  );

  if (error) {
    throw error;
  }
  if (!page) {
    throw new Error("Page not found");
  }
  return page;
}

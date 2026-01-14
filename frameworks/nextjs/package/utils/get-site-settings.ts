import { db, safeQuery, schema } from "@chaibuilder/sdk/server";
import { eq } from "drizzle-orm";

export async function getSiteSettings(
  appId: string,
  draftMode: boolean
): Promise<{ fallbackLang?: string; [key: string]: unknown }> {
  const table = draftMode ? db.query.apps : db.query.appsOnline;
  const { data: settings, error } = await safeQuery(() =>
    table.findFirst({
      where: eq(schema.apps.id, appId),
      columns: {
        theme: true,
        fallbackLang: true,
        languages: true,
        settings: true,
        designTokens: true,
      },
    })
  );

  if (error) {
    throw error;
  }
  if (!settings) {
    throw new Error("Site settings not found");
  }
  return settings as { fallbackLang?: string; [key: string]: unknown };
}

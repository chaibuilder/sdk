import { db, safeQuery, schema } from "@/actions/db";
import { apiError } from "@/actions/lib";
import { and, eq, or } from "drizzle-orm";
import { omit } from "lodash-es";
import { z } from "zod";
import { ChaiBaseAction } from "./base-action";

type GetLanguagePagesActionData = {
  id: string;
};

type GetLanguagePagesActionResponse = Array<{
  id: string;
  name: string;
  slug: string;
  lang: string;
  primaryPage?: string | null;
  pageType?: string | null;
  seo: any;
  currentEditor?: string | null;
  online: boolean | null;
  parent?: string | null;
  metadata: any;
  dynamic: boolean | null;
  dynamicSlugCustom: string | null;
}>;

export class GetLanguagePagesAction extends ChaiBaseAction<GetLanguagePagesActionData, GetLanguagePagesActionResponse> {
  protected getValidationSchema() {
    return z.object({
      id: z.string(),
    });
  }

  async execute(data: GetLanguagePagesActionData): Promise<GetLanguagePagesActionResponse> {
    if (!this.context) {
      throw apiError("CONTEXT_NOT_SET", new Error("CONTEXT_NOT_SET"));
    }

    const { appId } = this.context;
    const { id } = data;

    // Get all language pages for the given page ID (primary page or the page itself)
    const { data: pages, error } = await safeQuery(() =>
      db
        .select({
          id: schema.appPages.id,
          name: schema.appPages.name,
          slug: schema.appPages.slug,
          lang: schema.appPages.lang,
          primaryPage: schema.appPages.primaryPage,
          pageType: schema.appPages.pageType,
          seo: schema.appPages.seo,
          jsonld: schema.appPages.jsonld,
          currentEditor: schema.appPages.currentEditor,
          online: schema.appPages.online,
          parent: schema.appPages.parent,
          metadata: schema.appPages.metadata,
          dynamic: schema.appPages.dynamic,
          dynamicSlugCustom: schema.appPages.dynamicSlugCustom,
        })
        .from(schema.appPages)
        .where(
          and(eq(schema.appPages.app, appId), or(eq(schema.appPages.primaryPage, id), eq(schema.appPages.id, id))),
        ),
    );

    if (error) {
      throw apiError("LANGUAGE_PAGES_ERROR", error);
    }

    return pages.map((page) => {
      const cleanedPage: any = omit(page, ["app"]);
      if (cleanedPage.jsonld && Object.keys(cleanedPage.jsonld).length > 0) {
        cleanedPage.seo = {
          ...cleanedPage.seo,
          jsonLD: JSON.stringify(cleanedPage.jsonld),
        };
      }
      return cleanedPage as GetLanguagePagesActionResponse[0];
    });
  }
}

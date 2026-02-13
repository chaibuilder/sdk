import { isEmpty } from "lodash-es";
import { z } from "zod";
import { ChaiBaseAction } from "./base-action";
import { GetCollectionsAction } from "./get-collections";
import { GetLibrariesAction } from "./get-libraries";
import { GetPageTypesAction } from "./get-page-types";
import { GetWebsitePagesAction } from "./get-website-pages";
import { GetWebsiteSettingsAction } from "./get-website-settings";

type GetWebsiteDataActionData = Record<string, never>;

type GetWebsiteDataActionResponse = {
  websiteSettings: any;
  websitePages: any;
  pageTypes: any;
  changes: any;
  libraries: any;
  collections: any;
  siteWideUsage: any;
};

export class GetWebsiteDataAction extends ChaiBaseAction<GetWebsiteDataActionData, GetWebsiteDataActionResponse> {
  protected getValidationSchema() {
    return z.object({}).optional().default({});
  }

  async execute(): Promise<GetWebsiteDataActionResponse> {
    const websiteSettingsAction = new GetWebsiteSettingsAction();
    const websitePagesAction = new GetWebsitePagesAction();
    const pageTypesAction = new GetPageTypesAction();
    const librariesAction = new GetLibrariesAction();
    const collectionsAction = new GetCollectionsAction();

    // Set context on all sub-actions
    if (this.context) {
      websiteSettingsAction.setContext(this.context);
      websitePagesAction.setContext(this.context);
      pageTypesAction.setContext(this.context);
      librariesAction.setContext(this.context);
      collectionsAction.setContext(this.context);
    }

    // Execute remaining actions in parallel
    // NOTE: websitePagesAction fetches only primary pages (lang = "")
    const [websiteSettings, websitePages, pageTypes, libraries, collections] = await Promise.all([
      websiteSettingsAction.execute({ draft: true }),
      websitePagesAction.execute({ lang: "" }),
      pageTypesAction.execute(),
      librariesAction.execute(),
      collectionsAction.execute(),
    ]);

    // Derive changes from primary pages
    const changes = this.deriveChanges(websitePages, websiteSettings);

    // Derive siteWideUsage from default language pages
    const siteWideUsage = this.deriveSiteWideUsage(websitePages);

    return {
      websiteSettings,
      websitePages,
      pageTypes,
      changes,
      libraries,
      collections,
      siteWideUsage,
    };
  }

  /**
   * Derive changes from primary pages (lang = "").
   * Replicates the logic from GetChangesAction:
   *  1. Pages with changes (changes column is not null)
   *  2. Offline pages (online=false, no currentEditor) → changes: ["Take Online"]
   *  3. Theme / Design Token changes from the apps table (via websiteSettings)
   */
  private deriveChanges(primaryPages: any[], websiteSettings: any): any[] {
    // 1. Pages with non-null changes
    const changedPages = primaryPages
      .filter((p: any) => p.changes !== null && p.changes !== undefined)
      .map((p: any) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        pageType: p.pageType,
        lang: p.lang,
        changes: p.changes as string[],
        primaryPage: p.primaryPage,
        online: p.online,
        currentEditor: p.currentEditor,
      }));

    // 2. Offline pages (no currentEditor AND online === false)
    const offlinePages = primaryPages
      .filter((p) => p.currentEditor === null && p.online === false)
      .map((p: any) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        pageType: p.pageType,
        lang: p.lang,
        changes: ["Take Online"] as string[],
        primaryPage: p.primaryPage,
        online: p.online,
      }));

    // Remove changed pages that are already in offlinePages (offline takes priority)
    const offlinePageIds = new Set(offlinePages.map((p) => p.id));
    const filteredChangedPages = changedPages.filter((p) => !offlinePageIds.has(p.id));

    const changes: any[] = [...filteredChangedPages, ...offlinePages];

    // 3. Theme / Design Token changes from the apps table
    //    GetWebsiteSettingsAction now includes appChanges (from apps.changes column)
    const appChanges = (websiteSettings?.appChanges ?? []) as string[];
    if (appChanges.includes("THEME")) {
      changes.push({
        id: "THEME",
        slug: "",
        name: "Theme",
        pageType: "theme",
        lang: "",
        changes: ["Updated"],
        primaryPage: null,
        online: true,
      });
    }
    if (appChanges.includes("DESIGN_TOKENS")) {
      changes.push({
        id: "DESIGN_TOKENS",
        slug: "",
        name: "Design Tokens",
        pageType: "design_tokens",
        lang: "",
        changes: ["Updated"],
        primaryPage: null,
        online: true,
      });
    }

    return changes;
  }

  /**
   * Derive siteWideUsage from default language pages (lang = "").
   * Replicates the logic from GetSiteWideDataAction.
   */
  private deriveSiteWideUsage(defaultLangPages: any[]): Record<string, any> {
    const siteWideUsage: Record<string, any> = {};
    for (const page of defaultLangPages) {
      siteWideUsage[page.id] = {
        name: page.name,
        isPartial: isEmpty(page.slug),
        partialBlocks: !page.partialBlocks ? [] : (page.partialBlocks as string).split("|").filter(Boolean),
        links: !page.links ? [] : (page.links as string).split("|").filter(Boolean),
        designTokens: (page.designTokens ?? {}) as Record<string, Record<string, string>>,
      };
    }
    return siteWideUsage;
  }
}

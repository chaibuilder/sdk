import { ChaiBlock, ChaiPageProps, getRegisteredChaiBlock } from "@chaibuilder/runtime";
import { get, has, isEmpty, isFunction, omit, startsWith } from "lodash-es";
import {
  AIChatOptions,
  AssetsParams,
  ChaiBuilderPagesAIInterface,
  ChaiBuilderPagesAssetsInterface,
  ChaiBuilderPagesBackendInterface,
  ChaiBuilderPagesInterface,
  ChaiBuilderPagesUsersInterface,
} from "../export";
import { getChaiGlobalData } from "../register/register-global-data-provider";
import { getChaiPageType, getChaiPageTypes, registerChaiPageType } from "../register/register-page-type";
import { registerChaiPartialType } from "../register/register-partial-type";
import { getChaiCollection, getChaiCollections } from "../register/regsiter-collection";
import { ChaiBuilderPageType } from "../types";
import { ChaiAIChatHandler } from "./class-ai-chat-handler";
import { ChaiBuilderPagesAssets } from "./class-chaibuilder-pages-assets";
import { ChaiBuilderPagesUsers } from "./class-chaibuilder-pages-users";

export type ChaiBuilderPagesOptions = {
  backend: ChaiBuilderPagesBackendInterface;
  users?: ChaiBuilderPagesUsersInterface;
  assets?: ChaiBuilderPagesAssetsInterface;
  ai?: ChaiBuilderPagesAIInterface;
};

export class ChaiBuilderPages implements ChaiBuilderPagesInterface {
  private fallbackLang: string = "";
  private draftMode: boolean = false;
  protected backend: ChaiBuilderPagesBackendInterface;
  protected chaiUsers: ChaiBuilderPagesUsersInterface;
  protected chaiAssets: ChaiBuilderPagesAssetsInterface;
  protected chaiAI: ChaiBuilderPagesAIInterface;

  constructor(options: ChaiBuilderPagesOptions) {
    this.backend = options.backend;
    this._registerDefaultPageTypes();
    this.chaiUsers = options.users ?? new ChaiBuilderPagesUsers(this.backend);
    this.chaiAssets = options.assets ?? new ChaiBuilderPagesAssets(this.backend);
    this.chaiAI = options.ai ?? new ChaiAIChatHandler();
  }

  private _registerDefaultPageTypes() {
    registerChaiPageType("page", {
      name: "Static Page",
      icon: `<svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M5 8V20H19V8H5ZM5 6H19V4H5V6ZM20 22H4C3.44772 22 3 21.5523 3 21V3C3 2.44772 3.44772 2 4 2H20C20.5523 2 21 2.44772 21 3V21C21 21.5523 20.5523 22 20 22ZM7 10H11V14H7V10ZM7 16H17V18H7V16ZM13 11H17V13H13V11Z"></path></svg>`,
    });
    registerChaiPartialType("global", {
      name: "Global Block",
      helpText: "A global block can be reused in multiple pages.",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hash-icon lucide-hash"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>`,
    });
  }

  setFallbackLang(lang: string) {
    if (isEmpty(lang)) {
      throw new Error("Fallback language cannot be empty");
    }
    this.fallbackLang = lang;
  }

  getFallbackLang() {
    return this.fallbackLang;
  }

  setDraftMode(draft: boolean) {
    this.draftMode = draft;
  }

  isDraftMode() {
    return this.draftMode;
  }

  async handle(body: { action: string; data: Record<string, any> }, authToken: string, res?: any) {
    switch (body.action) {
      // Media
      case "UPLOAD_ASSET":
        return this.chaiAssets?.upload(
          {
            file: body.data.file as Base64URLString,
            name: body.data.name,
            folderId: body.data.folderId ?? null,
            optimize: body.data.optimize ?? true,
          },
          authToken,
        );
      case "GET_ASSET":
        return this.chaiAssets?.getAsset(body.data as { id: string }, authToken);
      case "GET_ASSETS":
        return this.chaiAssets?.getAssets(body.data as AssetsParams, authToken);
      case "DELETE_ASSET":
        return this.chaiAssets?.deleteAsset(body.data as { id: string }, authToken);
      case "UPDATE_ASSET":
        return this.chaiAssets?.updateAsset(body.data as any, authToken);

      // Users
      case "REFRESH_TOKEN":
        return this.chaiUsers?.refreshToken(body.data as { accessToken: string; refreshToken: string });
      case "LOGIN":
        return this.chaiUsers?.login(body.data as { email: string; password: string });
      case "LOGOUT":
        return this.chaiUsers?.logout();
      case "CHECK_USER_STATUS":
        return this.chaiUsers?.isUserActive(authToken as string);
      case "GET_ROLE_AND_PERMISSIONS":
        return this.chaiUsers?.getUserRoleAndPermissions(authToken as string);
      case "GET_CHAI_USER":
        return this.chaiUsers?.getUserInfo(authToken as string, body.data as { userId: string });
      case "ASK_AI":
        return this.chaiAI?.handleRequest(body.data as AIChatOptions, res);
      default:
    }

    // Builder
    if (body.action === "GET_BUILDER_PAGE_DATA") {
      const globalData = await getChaiGlobalData({
        lang: body.data.lang,
        draft: true,
        inBuilder: true,
      });
      const pageType: ChaiBuilderPageType | undefined = getChaiPageType(body.data.pageType);
      if (!pageType) {
        return { global: globalData };
      }
      return {
        ...(pageType.dataProvider
          ? await pageType.dataProvider({
              lang: body.data.lang,
              draft: true,
              inBuilder: true,
              pageProps: body.data.pageProps ?? {},
            })
          : {}),
        ...{ global: globalData },
      };
    }
    if (body.action === "GET_PAGE_TYPES") {
      return Promise.all(
        getChaiPageTypes().map(async (pageType) => ({
          key: pageType.key,
          helpText: pageType.helpText ?? "",
          icon: pageType.icon ?? "",
          dynamicSegments: pageType.dynamicSegments ?? "",
          dynamicSlug: pageType.dynamicSlug ?? "",
          hasSlug: pageType.hasSlug ?? true,
          name: typeof pageType.name === "function" ? await pageType.name() : pageType.name,
          ...(isFunction(pageType.defaultTrackingInfo) ? { trackingDefault: pageType.defaultTrackingInfo() } : {}),
          ...(isFunction(pageType.defaultSeo) ? { defaultSeo: pageType.defaultSeo() } : {}),
          ...(isFunction(pageType.defaultJSONLD) ? { defaultJSONLD: pageType.defaultJSONLD() } : {}),
        })),
      );
    }
    if (body.action === "SEARCH_PAGE_TYPE_ITEMS") {
      const pageType: ChaiBuilderPageType | undefined = getChaiPageType(body.data.pageType);
      if (!pageType) {
        return { error: "Page type not found" };
      }
      if (pageType.search) {
        return await pageType.search(body.data.query);
      }

      return this.backend.handleAction(body, authToken);
    }
    if (body.action === "GET_DYNAMIC_PAGES") {
      const pageType: ChaiBuilderPageType | undefined = getChaiPageType(body.data.pageType);
      if (!pageType) {
        return { error: "Page type not found" };
      }
      if (pageType.getDynamicPages) {
        return await pageType.getDynamicPages(body.data);
      }
      return [];
    }
    if (body.action === "GET_COLLECTIONS") {
      return getChaiCollections().map((collection) => omit(collection, "fetch"));
    }
    if (body.action === "GET_BLOCK_ASYNC_PROPS") {
      const block = body.data.block;
      const blockType = block._type;
      if (blockType === "Repeater" && block?.repeaterItems.includes("{{#")) {
        const collectionKey = block.repeaterItems.replace("{{#", "").replace("}}", "");
        const collection = getChaiCollection(collectionKey);
        if (!collection) {
          return [];
        }
        return (
          (await collection?.fetch({
            block,
            pageProps: body.data.pageProps,
            lang: body.data.lang,
            draft: true,
            inBuilder: true,
          })) ?? []
        );
      } else {
        const blockDef = getRegisteredChaiBlock(blockType);
        if (!blockDef || !isFunction(blockDef.dataProvider)) {
          return {};
        }
        return (
          (await blockDef.dataProvider({
            block,
            pageProps: body.data.pageProps,
            lang: body.data.lang,
            draft: true,
            inBuilder: true,
          })) ?? {}
        );
      }
    }

    const data = await this.backend.handleAction(body, authToken);
    this.emit(body.action, data);
    return data;
  }

  emit(action: string, data: any) {
    if (!["CREATE_PAGE", "UPDATE_PAGE", "DELETE_PAGE"].includes(action)) return;

    const page = get(data, "page");
    if (!page) return;

    const pageType = getChaiPageType(page.pageType);
    if (!pageType) return;

    switch (action) {
      case "CREATE_PAGE":
        return pageType.onCreate?.(page);
      case "UPDATE_PAGE":
        return pageType.onUpdate?.(page);
      case "DELETE_PAGE":
        return pageType.onDelete?.(page);
    }
  }

  /**
   * Resolve a page link
   * @param href - The href to resolve
   * @returns The resolved link
   */
  async resolvePageLink(href: string, lang: string) {
    // href is of format "pageType:${pageTypeKey}:${id}"
    if (!startsWith(href, "pageType:")) {
      return href;
    }
    const pageTypeKey = href.split(":")[1];
    const id = href.split(":")[2];
    const pageType: ChaiBuilderPageType | undefined = getChaiPageType(pageTypeKey);
    if (!pageType) {
      return href;
    }
    return await this.resolveLink(pageType.key, id, lang);
  }

  async resolveLink(pageTypeKey: string, id: string, lang: string) {
    const pageType: ChaiBuilderPageType | undefined = getChaiPageType(pageTypeKey);
    if (!pageType) {
      return "/not-found";
    }
    const draft = this.isDraftMode();
    if (pageType.resolveLink) {
      return await pageType.resolveLink(id, draft, lang);
    }
    return await this.backend.handleAction({
      action: "GET_LINK",
      data: {
        pageType: pageTypeKey,
        id,
        draft,
        lang: lang === this.getFallbackLang() ? "" : lang,
      },
    });
  }

  async getPageBySlug(slug: string) {
    const draft = this.isDraftMode();
    const segments: Record<string, string> = {};
    getChaiPageTypes().forEach((pageType) => {
      if (has(pageType, "dynamicSegments") && pageType.dynamicSegments) {
        segments[pageType.key] = pageType.dynamicSegments;
      }
    });
    return await this.backend.handleAction({
      action: "GET_PAGE_META",
      data: { slug, draft, dynamicSegments: segments },
    });
  }

  async getFullPage(id: string) {
    const draft = this.isDraftMode();
    return await this.backend.handleAction({
      action: "GET_PAGE",
      data: {
        id,
        draft,
        mergePartials: true,
      },
    });
  }

  async getRevisionPage({ id, type, lang }: { id: string; type: "draft" | "live" | "revision"; lang: string }) {
    const langToUse = this.getFallbackLang() === lang ? "" : lang;
    return await this.backend.handleAction({
      action: "GET_REVISION_PAGE",
      data: {
        id,
        type,
        ...(langToUse ? { lang: langToUse } : {}),
      },
    });
  }

  async getSiteSettings() {
    const draft = this.isDraftMode();
    return await this.backend.handleAction({
      action: "GET_WEBSITE_SETTINGS",
      data: { draft },
    });
  }

  async getPageData({
    blocks,
    pageType,
    pageProps,
    lang,
  }: {
    blocks: ChaiBlock[];
    pageType: string;
    pageProps: ChaiPageProps;
    lang: string;
  }) {
    const draft = this.isDraftMode();
    const registeredPageType = getChaiPageType(pageType);
    // get all collection repeater blocks
    const collectionRepeaterBlocks = blocks.filter(
      (block) => block._type === "Repeater" && block?.repeaterItems.includes("{{#"),
    );

    let collectionData: Record<string, any> = {};
    if (collectionRepeaterBlocks.length > 0) {
      const collectionKeys = collectionRepeaterBlocks.map((block) => {
        const collectionId: string = block.repeaterItems.replace("{{#", "").replace("}}", "");
        return { collectionId, block };
      });
      const collectionBlocks = await Promise.all(
        collectionKeys.map(async ({ collectionId, block }) => {
          const chaiCollection = getChaiCollection(collectionId);
          try {
            const data = await chaiCollection?.fetch({
              lang,
              draft,
              inBuilder: false,
              pageProps,
              block,
            });
            return Promise.resolve({
              [`#${collectionId}/${block._id}`]: get(data, "items", []) ?? [],
              [`#${collectionId}/${block._id}/totalItems`]: get(data, "totalItems", -1) ?? -1,
            });
          } catch {
            return Promise.resolve({
              [`#${collectionId}/${block._id}`]: [],
              [`#${collectionId}/${block._id}/totalItems`]: -1,
            });
          }
        }),
      );
      collectionData = collectionBlocks.reduce((acc, block) => {
        return { ...acc, ...block };
      }, {});
    }

    const [globalData, pageData] = await Promise.all([
      this.getGlobalData(lang),
      registeredPageType?.dataProvider?.({
        lang,
        draft,
        inBuilder: false,
        pageProps,
      }) || Promise.resolve({}),
    ]);

    if (!registeredPageType) return { global: globalData, ...collectionData };

    return {
      ...pageData,
      global: globalData,
      ...collectionData,
    };
  }

  async getGlobalData(lang: string) {
    return await getChaiGlobalData({
      lang,
      draft: this.isDraftMode(),
      inBuilder: false,
    });
  }

  async request(body: any) {
    return await this.backend.handleAction(body);
  }

  /**
   * Get the AI handler instance for direct access (e.g., for streaming)
   */
  getAIHandler() {
    return this.chaiAI;
  }
}

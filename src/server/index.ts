import { filter, isEmpty, map } from "lodash-es";
import type { ChaiBlock } from "../core/main";
import type { ChaiPageData } from "../render/index.ts";
import { getChaiDataProviders } from "@chaibuilder/runtime";

type ChaiPage = {
  uuid: string;
  name: string;
  slug: string;
  blocks: ChaiBlock[];
  seoData: object;
  providers: { providerKey: string; args: Record<string, any> }[];
  type: "STATIC" | "DYNAMIC" | "SUBPAGE";
  project: string;
  lockedBy: null | { name: string; self: boolean; email: string };
};

type ChaiProject = {
  uuid: string;
  brandingOptions: Record<string, string | number>;
  favicon: string;
  homepage: string;
  name: string;
  description?: string;
  seoData: Record<string, string>;
  primaryLanguage?: string;
  password?: string;
  languages?: Array<string>;
  user?: string;
};

type ChaiAsset = {
  id: string;
  url: string;
  thumbUrl: string;
};

type ChaiSubPage = Pick<ChaiPage, "uuid" | "name" | "blocks" | "type" | "project" | "providers" | "lockedBy">;

type ChaiApiResponse<T> = Promise<{ data: T; error: null; result: "success" | "error" }>;

interface ChaibuilderBackendInterface {
  getPage(uuid: string): ChaiApiResponse<ChaiPage & { subPages: ChaiSubPage[] }>;
  getPages(): ChaiApiResponse<ChaiPage>;
  addPage(page: Pick<ChaiPage, "name" | "slug">): ChaiApiResponse<ChaiPage>;
  deletePage(uuid: string): ChaiApiResponse<null>;
  updatePage(page: ChaiPage): ChaiApiResponse<ChaiPage>;
  // searchPages(query: string): TChaiResponse<ChaiPage[]>;

  getProject(): ChaiApiResponse<ChaiProject>;
  updateProject(project: Partial<ChaiProject>): ChaiApiResponse<ChaiProject>;

  uploadAsset(formData: FormData): ChaiApiResponse<{ url: string }>;
  getAssets(): ChaiApiResponse<ChaiAsset[]>;

  login({
    password,
    email,
  }: {
    password: string;
    email: string;
  }): ChaiApiResponse<{ accessToken: string; name: string; email: string }>;
  logout(): ChaiApiResponse<any>;
  unlockPage(uuid: string): ChaiApiResponse<any>;
}

const BASE_URL: string = "https://api.chaibuilder.com";

class ChaibuilderBackend implements ChaibuilderBackendInterface {
  private _authSecret: string;
  private _accessToken: string | null = null;
  private readonly _appKey: string;

  constructor(authSecret: string, appKey: string) {
    if (!authSecret) throw "Please provide valid auth secret.";
    if (!appKey) throw "Please provide valid project key.";
    this._authSecret = authSecret;
    this._appKey = appKey;
  }

  setAccessToken(token: string | null) {
    this._accessToken = token;
  }

  async getPageData(slug: string) {
    const headers = this.getHeaders();
    const url = this.getURL("page-data", !isEmpty(slug) ? { slug } : {});
    const method = "GET";
    const options = {
      method,
      headers,
      next: { tags: ["everything", isEmpty(slug) ? "_homepage" : slug] },
    };
    return this.fetchAPI(url, options) as ChaiApiResponse<ChaiPageData | null>;
  }

  async unlockPage(uuid: string) {
    if (!uuid)
      return Promise.reject({
        data: null,
        error: { message: "Invalid page uuid" },
        result: "error",
      });
    const headers = this.getHeaders();
    const url = this.getURL("page/unlock");
    const method = "POST";
    const options = { method, headers, body: JSON.stringify({ uuid }) };
    return this.fetchAPI(url, options) as ChaiApiResponse<any>;
  }

  /**
   *
   * @param uuid
   * @returns Detail Single Page Information
   */
  async getPage(uuid: string) {
    if (!uuid)
      return Promise.reject({
        data: null,
        error: { message: "Invalid page uuid" },
        result: "error",
      });
    const headers = this.getHeaders();
    const url = this.getURL("page", { uuid });
    const method = "GET";
    const options = { method, headers };
    return this.fetchAPI(url, options) as ChaiApiResponse<ChaiPage & { subPages: ChaiSubPage[] }>;
  }

  /**
   *
   * @returns List of all pages
   */
  // @ts-ignore
  async getPages() {
    const headers = this.getHeaders();
    const url = this.getURL("pages");
    const method = "GET";
    const options = { method, headers };
    return this.fetchAPI(url, options) as ChaiApiResponse<Omit<ChaiPage, "blocks">[]>;
  }

  /**
   *
   * @param page
   * @returns Detail of new page
   */
  async addPage(page: Pick<ChaiPage, "name" | "slug">) {
    const body = JSON.stringify(page);
    const headers = this.getHeaders();
    const url = this.getURL("page");
    const method = "POST";
    const options = { method, headers, body };
    return this.fetchAPI(url, options) as ChaiApiResponse<ChaiPage>;
  }

  /**
   *
   * @param uuid
   * @returns Success | Error Message
   */
  async deletePage(uuid: string) {
    if (!uuid)
      return Promise.reject({
        data: null,
        error: { message: "Invalid page uuid" },
        result: "error",
      });
    const headers = this.getHeaders();
    const url = this.getURL("page", { uuid });
    const method = "DELETE";
    const options = { method, headers };
    return this.fetchAPI(url, options) as ChaiApiResponse<null>;
  }

  /**
   *
   * @param page
   * @returns Update page information or Error response
   */
  async updatePage(page: ChaiPage) {
    const body = JSON.stringify(page);
    const headers = this.getHeaders();
    const url = this.getURL("page");
    const method = "PUT";
    const options = { method, headers, body };
    return this.fetchAPI(url, options) as ChaiApiResponse<ChaiPage>;
  }

  /**
   *
   * @returns Project detail
   */
  async getProject() {
    const headers = this.getHeaders();
    const url = this.getURL("project");
    const method = "GET";
    const options = { method, headers };
    return this.fetchAPI(url, options) as ChaiApiResponse<ChaiProject>;
  }

  /**
   *
   * @param project
   * @returns Updated project detail
   */
  async updateProject(project: Partial<ChaiProject>) {
    const body = JSON.stringify(project);
    const headers = this.getHeaders();
    const url = this.getURL("project");
    const method = "PUT";
    const options = { method, headers, body };
    return this.fetchAPI(url, options) as ChaiApiResponse<ChaiProject>;
  }

  /**
   *
   * @returns Upload asset
   * @param formData
   */
  async uploadAsset(formData: FormData) {
    const headers = this.getHeaders();
    const url = this.getURL("asset");
    const method = "POST";
    const file = (await formData.get("file")) as unknown as File;
    const newFormData = new FormData();
    newFormData.append("file", file);
    const options = { method, headers, body: newFormData };
    return this.fetchAPI(url, options) as ChaiApiResponse<{ url: string }>;
  }

  /**
   *
   * @returns Get assets
   * @param limit
   * @param offset
   */
  async getAssets(limit?: string, offset?: string) {
    const headers = this.getHeaders();
    const url = this.getURL("asset");

    if (limit) url.concat(`?limit=${limit}`);
    if (offset) url.concat(`&offset=${offset}`);
    const method = "GET";
    const options = { method, headers };
    return this.fetchAPI(url, options) as ChaiApiResponse<ChaiAsset[]>;
  }

  /**
   *
   * @param { password }
   * @returns { token }
   */
  async authenticate({ password }: { password: string }) {
    const body = JSON.stringify({ password });
    const headers = this.getHeaders();
    const url = this.getURL("authenticate");
    const method = "POST";
    const options = { method, headers, body };
    return this.fetchAPI(url, options) as ChaiApiResponse<{ token: string }>;
  }

  /**
   *
   * @param { password }
   * @returns { token }
   */
  async login({ password, email }: { password: string; email: string }) {
    const body = JSON.stringify({ password, email });
    const headers = this.getHeaders();
    const url = this.getURL("login");
    const method = "POST";
    const options = { method, headers, body };
    return this.fetchAPI(url, options) as ChaiApiResponse<{ accessToken: string; name: string; email: string }>;
  }

  /**
   *
   * @returns { token }
   */
  async logout() {
    const headers = this.getHeaders();
    const url = this.getURL("logout");
    const method = "POST";
    const options = { method, headers };
    return this.fetchAPI(url, options) as ChaiApiResponse<true>;
  }

  /**
   *
   * @returns { result: 'success' | 'error' }
   */
  async verify() {
    const headers = this.getHeaders();
    const url = this.getURL("verify");
    const method = "POST";
    const options = { method, headers };
    return this.fetchAPI(url, options) as ChaiApiResponse<{ result: string }>;
  }

  /**
   *
   * @param endpoint
   * @param queryParam
   * @returns api endpoint with query param
   */
  private getURL(endpoint: string, queryParam?: Record<string, any>): string {
    const query = new URLSearchParams(queryParam).toString();
    if (!isEmpty(queryParam)) return `${BASE_URL}/v1/${endpoint}?${query}`;
    return `${BASE_URL}/v1/${endpoint}`;
  }

  /**
   *
   * @returns headers for api
   */
  private getHeaders() {
    const headers = new Headers();
    headers.append("x-chai-app-key", this._appKey);
    headers.append("x-chai-auth-secret", this._authSecret);
    if (this._accessToken) headers.append("x-chai-access-token", this._accessToken);
    return headers;
  }

  /**
   *
   * @returns Fetch API
   */
  private async fetchAPI(url: string, options: object) {
    try {
      const response = await fetch(url, options).then((res) => res.json());
      if (response?.result === "success") {
        return { data: response?.data, error: null, result: "success" };
      } else {
        throw response?.error;
      }
    } catch (error) {
      return { data: null, error, result: "error" };
    }
  }
}

const prepareExternalData = async (
  providers: { providerKey: string; args: Record<string, unknown> }[],
  currentPageUrl: string,
) => {
  const allProviders = getChaiDataProviders();
  // get the page providers from all providers
  const pageProviders = filter(allProviders, (provider) => {
    return map(providers, "providerKey").includes(provider.providerKey);
  });
  const externalData = {};
  const errors = [];
  for (const provider of pageProviders) {
    try {
      externalData[provider.providerKey] = await provider.dataFn({}, currentPageUrl);
    } catch (error) {
      errors.push(error);
    }
  }
  return { data: externalData, errors };
};

export { ChaibuilderBackend, prepareExternalData };

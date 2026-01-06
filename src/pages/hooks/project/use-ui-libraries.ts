import { ChaiLibrary, ChaiLibraryBlock, getBlocksFromHTML, registerChaiLibrary } from "@chaibuilder/sdk";
import { useQuery } from "@tanstack/react-query";
import { get, isArray } from "lodash-es";
import { useFetch } from "../utils/use-fetch";
import { useApiUrl } from "./use-builder-prop";

const uiLibrariesChaiApi = {
  async getUILibraryBlock(uiLibBlock: ChaiLibraryBlock, fetchAPI: any, apiUrl: string) {
    const response = await fetchAPI(apiUrl, {
      action: "GET_LIBRARY_ITEM",
      data: { id: uiLibBlock.id },
    });
    const html = get(response, "html", "");
    const blocks = get(response, "blocks", []);
    return isArray(blocks) ? blocks : getBlocksFromHTML(html);
  },

  async getUILibraryBlocks(uiLibrary: ChaiLibrary, fetchAPI: any, apiUrl: string) {
    try {
      const response = await fetchAPI(apiUrl, {
        action: "GET_LIBRARY_ITEMS",
        data: { id: uiLibrary.id },
      });
      return response.map((b: { preview: string }) => ({
        ...b,
      }));
    } catch (_e: unknown) {
      console.error(_e);
      return [];
    }
  },
};

export const useUILibraries = () => {
  const apiUrl = useApiUrl();
  const fetchAPI = useFetch();
  return useQuery({
    queryKey: ["uiLibraries"],
    staleTime: "static",
    queryFn: async () => {
      const response = await fetchAPI(apiUrl, { action: "GET_LIBRARIES" });
      const libraries = response.map((library: any) => ({
        ...library,
      }));
      libraries.forEach((library: any) => {
        registerChaiLibrary(library.id, {
          name: library.isSiteLibrary ? library.name + " (Current Site) " : library.name,
          description: library.description,
          getBlocksList: (library: any) => {
            return uiLibrariesChaiApi.getUILibraryBlocks(library, fetchAPI, apiUrl);
          },
          getBlock: ({ block }: { block: any }) => {
            return uiLibrariesChaiApi.getUILibraryBlock(block, fetchAPI, apiUrl);
          },
        });
      });
      return libraries;
    },
  });
};

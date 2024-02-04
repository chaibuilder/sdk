import { getBlocksFromHTML } from "../../core/lib";
import { useMutation } from "@tanstack/react-query";
import { capitalize, filter, has, set, sortBy } from "lodash";
import { useApiBaseUrl } from "./useApiBaseUrl.ts";
import { fetchWrapper } from "../fetch.ts";

export const useUiLibraryBlocks = (): any => {
  const baseUrl = useApiBaseUrl();
  return useMutation({
    mutationFn: async () => {
      const { data: resp } = await fetchWrapper.get(`${baseUrl}/library`).then((res) => res.json());
      return sortBy(
        filter(resp, (block) => !has(block, "hidden")),
        "group",
      );
    },
  });
};

export const useExternalPredefinedBlock = (): any => {
  const baseUrl = useApiBaseUrl();
  return useMutation({
    mutationFn: async (block: any) => {
      if (!block || !block.uuid) return [];
      try {
        const { data: res } = await fetchWrapper
          .get(`${baseUrl}/block?uuid=${block.uuid}&format=${block.format}`)
          .then(async (res) => (block.format === "html" ? getBlocksFromHTML(await res.text()) : await res.json()));
        set(res, "0._name", capitalize(block.group));
        return res || [];
      } catch (error) {
        return [];
      }
    },
  });
};

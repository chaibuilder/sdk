import { useQuery } from "@tanstack/react-query";
import { useApiBaseUrl } from "./useApiBaseUrl.ts";
import { fetchWrapper } from "../fetch.ts";

export const usePages = (): any => {
  const baseUrl = useApiBaseUrl();
  return useQuery({
    queryKey: ["pages"],
    queryFn: async () => {
      const { data: pages } = await fetchWrapper.get(`${baseUrl}/pages`).then((res) => res.json());
      return pages || [];
    },
  });
};

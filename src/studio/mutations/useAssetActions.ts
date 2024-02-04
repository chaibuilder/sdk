import { useMutation } from "@tanstack/react-query";
import { useApiBaseUrl } from "../hooks/useApiBaseUrl.ts";
import { getAccessToken } from "../fetch.ts";

export const useUploadAsset = () => {
  const baseUrl = useApiBaseUrl();
  return useMutation({
    mutationFn: async (file: any) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data: response } = await fetch(`${baseUrl}/upload`, {
        method: "POST",
        headers: { "x-chai-access-token": getAccessToken() },
        body: formData,
      }).then((res) => res.json());
      return response;
    },
  });
};

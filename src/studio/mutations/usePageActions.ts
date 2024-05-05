import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useChangePage } from "../hooks/useChangePage.ts";
import { useApiBaseUrl } from "../hooks/useApiBaseUrl.ts";
import { usePages } from "../hooks/usePages.ts";
import { useCurrentPage } from "../hooks/useCurrentPage.ts";
import { useProject } from "../hooks/useProject.ts";
import { fetchWrapper } from "../fetch.ts";

export const useAddPage = (): any => {
  const queryClient = useQueryClient();
  const changePage = useChangePage();
  const baseUrl = useApiBaseUrl();
  return useMutation({
    mutationFn: async (payload: any) => fetchWrapper.post(`${baseUrl}/pages`, payload).then((res) => res.json()),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      changePage({ uuid: response.uuid, slug: response.slug });
      toast.success("Page added successfully.");
    },
  });
};

export const useUpdatePage = (): any => {
  const baseUrl = useApiBaseUrl();
  const [currentPageId] = useCurrentPage();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => fetchWrapper.put(`${baseUrl}/page`, payload).then((res) => res.json()),
    onSuccess: async (data) => {
      if (data.result === "error" && data.error?.code == "PAGE_LOCKED") {
        queryClient.invalidateQueries({ queryKey: ["page_data", currentPageId] });
        return;
      }
      toast.success("Page saved successfully.");
    },
  });
};

export const usePublishPage = (): any => {
  const baseUrl = useApiBaseUrl();
  const { data: pages } = usePages();
  const [currentPageId] = useCurrentPage();
  const { data: projectData } = useProject();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const slug = pages.find((page: any) => page.uuid === currentPageId).slug;
      return await fetchWrapper
        .post(`${baseUrl}/publish`, {
          slug,
          uuid: currentPageId,
          isHomepage: projectData?.homepage === currentPageId,
        })
        .then((res) => res.json());
    },
    onSuccess: async (data) => {
      if (data.result === "error" && data.error?.code == "PAGE_LOCKED") {
        queryClient.invalidateQueries({ queryKey: ["page_data", currentPageId] });
        return;
      }
      toast.success("Page published successfully.", {
        position: "bottom-right",
        duration: 2000,
      });
    },
  });
};

export const useDeletePage = (): any => {
  const queryClient = useQueryClient();
  const baseUrl = useApiBaseUrl();
  return useMutation({
    mutationFn: async (payload: any) => fetchWrapper.delete(`${baseUrl}/page`, payload).then((res) => res.json()),
    onSuccess: () => {
      toast.success("Page deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });
};

export const useTakeControl = () => {
  const queryClient = useQueryClient();
  const baseUrl = useApiBaseUrl();
  return useMutation({
    mutationFn: async (pageUuid: string) =>
      fetchWrapper.post(`${baseUrl}/take-control`, { uuid: pageUuid }).then((res) => res.json()),
    onSuccess: (_data, pageUuid: string) => {
      queryClient.invalidateQueries({ queryKey: ["page_data", pageUuid] });
    },
  });
};

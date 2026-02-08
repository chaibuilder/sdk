import { useSavePage } from "@/hooks/use-save-page";
import { ACTIONS } from "@/pages/constants/ACTIONS";
import { ERRORS } from "@/pages/constants/ERRORS";
import { useActivePage, useChaiCurrentPage } from "@/pages/hooks/pages/use-current-page";
import { useApiUrl } from "@/pages/hooks/project/use-builder-prop";
import { usePageTypes } from "@/pages/hooks/project/use-page-types";
import { useFetch } from "@/pages/hooks/utils/use-fetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { find, get } from "lodash-es";
import { toast } from "sonner";

export const useCreatePage = () => {
  const apiUrl = useApiUrl();
  const queryClient = useQueryClient();
  const fetchAPI = useFetch();
  const { data: pageTypes } = usePageTypes();
  return useMutation({
    mutationFn: async (newPage: Partial<any>) => {
      const response = await fetchAPI(apiUrl, {
        action: ACTIONS.CREATE_PAGE,
        data: newPage,
      });
      return response;
    },
    onSuccess: (_, args: any) => {
      if (args && args?.primaryPage) {
        queryClient.invalidateQueries({
          queryKey: [ACTIONS.GET_LANGUAGE_PAGES, args?.primaryPage],
        });
        queryClient.invalidateQueries({
          queryKey: [ACTIONS.GET_WEBSITE_PAGES, args?.lang],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: [ACTIONS.GET_WEBSITE_PAGES],
        });
      }

      const successMessage = args.template
        ? `Page created from "${args.template.name}" template`
        : args.hasSlug === false
          ? "New " + find(pageTypes, { key: args.pageType })?.name + " added successfully"
          : "New page added successfully";

      toast.success(successMessage);
    },
    onError: (response, args) => {
      const pageTypeObject = find(pageTypes, { key: args.pageType });
      toast.error(`Failed to add new ${pageTypeObject?.hasSlug ? "page" : pageTypeObject.name}.`, {
        description: get(ERRORS, response.message, response.message),
      });
    },
  });
};

export const useUpdatePage = () => {
  const apiUrl = useApiUrl();
  const queryClient = useQueryClient();
  const fetchAPI = useFetch();
  const { data: activePage } = useActivePage();
  const { data: pageTypes } = usePageTypes();
  return useMutation({
    mutationFn: async (updatedPage: Partial<any>) => {
      const response = await fetchAPI(apiUrl, {
        action: ACTIONS.UPDATE_PAGE,
        data: updatedPage,
      });
      return response;
    },
    onSuccess: (_, args: any) => {
      if (activePage?.id === args?.id) {
        queryClient.invalidateQueries({
          queryKey: [ACTIONS.GET_LANGUAGE_PAGES],
        });
      }

      if (args && (args?.primaryPage || args?.seo)) {
        queryClient.invalidateQueries({
          queryKey: [ACTIONS.GET_LANGUAGE_PAGES, args?.primaryPage],
        });
        queryClient.invalidateQueries({
          queryKey: [ACTIONS.GET_WEBSITE_PAGES],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: [ACTIONS.GET_WEBSITE_PAGES],
        });
      }
    },
    onError: (response, args) => {
      const pageTypeObject = find(pageTypes, { key: args.pageType });
      toast.error(`Failed to update ${pageTypeObject?.hasSlug ? "page" : pageTypeObject.name}.`, {
        description: response.message,
      });
    },
  });
};

export const useDeletePage = () => {
  const apiUrl = useApiUrl();
  const queryClient = useQueryClient();
  const fetchAPI = useFetch();
  const { data: pageTypes } = usePageTypes();
  return useMutation({
    mutationFn: async (page: any) => {
      return fetchAPI(apiUrl, {
        action: ACTIONS.DELETE_PAGE,
        data: { id: page?.id },
      });
    },
    onSuccess: (response, args: any) => {
      if (response.code === "PAGE_LOCKED") {
        toast.error("Delete not allowed", {
          description: `Page is currently being edited by another user.`,
        });
        return;
      }
      if (args && args?.primaryPage) {
        queryClient.invalidateQueries({
          queryKey: [ACTIONS.GET_LANGUAGE_PAGES, args?.primaryPage],
        });
        queryClient.invalidateQueries({
          queryKey: [ACTIONS.GET_WEBSITE_PAGES],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: [ACTIONS.GET_WEBSITE_PAGES],
        });
      }
    },

    onError: (response, args: any) => {
      const pageTypeObject = find(pageTypes, { key: args.pageType });
      toast.error(`Failed to delete ${pageTypeObject?.hasSlug ? "page" : pageTypeObject.name}.`, {
        description: response.message,
      });
    },
  });
};

export const useUnpublishPage = () => {
  const apiUrl = useApiUrl();
  const queryClient = useQueryClient();
  const fetchAPI = useFetch();
  const { data: pageTypes } = usePageTypes();
  return useMutation({
    mutationFn: async (page: any) => {
      return fetchAPI(apiUrl, {
        action: ACTIONS.TAKE_OFFLINE,
        data: { id: page?.id },
      });
    },
    onSuccess: (_, args: any) => {
      if (args && args?.primaryPage) {
        queryClient.invalidateQueries({
          queryKey: [ACTIONS.GET_LANGUAGE_PAGES, args?.primaryPage],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: [ACTIONS.GET_WEBSITE_PAGES],
        });
      }
      const pageTypeObject = find(pageTypes, { key: args.pageType });
      toast.success(
        !pageTypeObject?.hasSlug
          ? "New " + pageTypeObject.name + " added successfully."
          : "Page unpublished successfully.",
      );
    },

    onError: (response, args: any) => {
      const pageTypeObject = find(pageTypes, { key: args.pageType });
      toast.error(`Failed to take offline ${pageTypeObject?.hasSlug ? "page" : pageTypeObject.name}.`, {
        description: response.message,
      });
    },
  });
};

export const usePublishPage = () => {
  const apiUrl = useApiUrl();
  const fetchAPI = useFetch();
  return useMutation({
    mutationFn: async (id: string) => {
      return fetchAPI(apiUrl, {
        action: ACTIONS.PUBLISH_PAGE,
        data: { id },
      });
    },
    onSuccess: () => {
      toast.success("Page published successfully.");
    },
    onError: () => {
      toast.error("Failed to publish page");
    },
  });
};

export const usePublishPages = () => {
  const apiUrl = useApiUrl();
  const fetchAPI = useFetch();
  const queryClient = useQueryClient();
  const { data: currentPage } = useChaiCurrentPage();
  const { savePageAsync } = useSavePage();

  return useMutation({
    mutationFn: async ({ ids, revisions }: { ids: string[]; revisions?: boolean }) => {
      await savePageAsync();

      return fetchAPI(apiUrl, {
        action: ACTIONS.PUBLISH_CHANGES,
        data: { ids, revisions },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ACTIONS.GET_CHANGES],
      });
      queryClient.invalidateQueries({
        queryKey: [ACTIONS.GET_WEBSITE_PAGES],
      });
      queryClient.invalidateQueries({
        queryKey: [ACTIONS.GET_LANGUAGE_PAGES, currentPage?.id],
      });
    },
    onError: (error) => {
      console.log("##", error);
      toast.error("Failed to publish pages.");
    },
  });
};

export const useMarkAsTemplate = () => {
  const apiUrl = useApiUrl();
  const fetchAPI = useFetch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      page: any;
      name: string;
      description?: string;
      pageType: string;
      previewImage?: string;
    }) => {
      return fetchAPI(apiUrl, {
        action: ACTIONS.MARK_AS_TEMPLATE,
        data: {
          id: data.page?.id,
          name: data.name,
          description: data.description,
          pageType: data.pageType,
          previewImage: data.previewImage,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ACTIONS.GET_WEBSITE_PAGES],
      });
      toast.success("Page marked as template successfully.");
    },
    onError: () => {
      toast.error("Failed to mark page as template.");
    },
  });
};

export const useUnmarkAsTemplate = () => {
  const apiUrl = useApiUrl();
  const fetchAPI = useFetch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (page: any) => {
      return fetchAPI(apiUrl, {
        action: ACTIONS.UNMARK_AS_TEMPLATE,
        data: { id: page?.id },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ACTIONS.GET_WEBSITE_PAGES],
      });
      toast.success("Page unmarked as template successfully.");
    },
    onError: () => {
      toast.error("Failed to unmark page as template.");
    },
  });
};

export const useChangeSlug = () => {
  const apiUrl = useApiUrl();
  const fetchAPI = useFetch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, slug }: { id: string; slug: string }) => {
      return fetchAPI(apiUrl, {
        action: ACTIONS.CHANGE_SLUG,
        data: { id, slug },
      });
    },
    onSuccess: (_, { primaryPage }: any) => {
      toast.success("Slug changed successfully.");
      if (primaryPage) {
        queryClient.invalidateQueries({
          queryKey: [ACTIONS.GET_LANGUAGE_PAGES, primaryPage],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: [ACTIONS.GET_WEBSITE_PAGES],
        });
      }
    },
    onError: () => {
      toast.error("Failed to change slug");
    },
  });
};

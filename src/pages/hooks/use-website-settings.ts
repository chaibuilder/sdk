import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ACTIONS } from "@/pages/constants/ACTIONS";
import { useApiUrl } from "@/pages/hooks/project/use-builder-prop";
import { useFetch } from "@/pages/hooks/utils/use-fetch";
import { toast } from "sonner";

type UpdateWebsiteSettingsPayload = {
  name?: string;
  languages?: string[];
  settings?: Record<string, any>;
  /**
   * Flag to indicate that languages were updated so we can invalidate related queries
   */
  isLanguageUpdate?: boolean;
};

type WebsiteSettingsResponse = {
  success: boolean;
  data?: any;
  error?: string;
};

type PublishWebsiteSettingsResponse = {
  success: boolean;
  error?: string;
};

/**
 * Hook to update website settings using the UPDATE_WEBSITE_SETTING action.
 * The server action resolves appId from the authenticated context, so no websiteId is required.
 */
export const useUpdateWebsiteSettings = () => {
  const apiUrl = useApiUrl();
  const fetchAPI = useFetch();
  const queryClient = useQueryClient();

  return useMutation<WebsiteSettingsResponse, Error, UpdateWebsiteSettingsPayload>({
    mutationFn: async (payload) => {
      const response = (await fetchAPI(apiUrl, {
        action: ACTIONS.UPDATE_WEBSITE_SETTING,
        data: payload,
      })) as WebsiteSettingsResponse;

      if (!response?.success) {
        throw new Error(response?.error || "Failed to update website settings");
      }

      return response;
    },
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: [ACTIONS.GET_WEBSITE_DRAFT_SETTINGS] });
      if (variables?.isLanguageUpdate) {
        queryClient.invalidateQueries({ queryKey: [ACTIONS.GET_WEBSITE_DRAFT_SETTINGS] });
      }
      toast.success("Website settings updated successfully.");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update website settings");
    },
  });
};

/**
 * Hook to publish website settings using the PUBLISH_WEBSITE_SETTINGS action.
 * The server action resolves appId from the authenticated context, so no websiteId is required.
 */
export const usePublishWebsiteSettings = () => {
  const apiUrl = useApiUrl();
  const fetchAPI = useFetch();

  return useMutation<PublishWebsiteSettingsResponse, Error, void>({
    mutationFn: async () => {
      const response = (await fetchAPI(apiUrl, {
        action: ACTIONS.PUBLISH_WEBSITE_SETTINGS,
      })) as PublishWebsiteSettingsResponse;

      if (!response?.success) {
        throw new Error(response?.error || "Failed to publish website settings");
      }

      return response;
    },
    onSuccess: () => {
      toast.success("Website settings published successfully.");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to publish website settings");
    },
  });
};

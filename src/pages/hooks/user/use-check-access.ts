import { fetchAPI } from "@/pages/utils/fetch-api";
import { useQuery } from "@tanstack/react-query";
import { noop } from "lodash-es";
import { toast } from "sonner";
import { useApiUrl, usePagesProp } from "../project/use-builder-prop";

/**
 * Hook to periodically check if the user has access to the app
 * @param checkInterval Interval in seconds (default 300 = 5 mins)
 * @returns Object with isChecking state - true until initial check completes
 */
export const useCheckUserAccess = (checkInterval: number = 30) => {
  const logout = usePagesProp("onLogout", noop);
  const getAccessToken = usePagesProp("getAccessToken");
  const apiUrl = useApiUrl();

  return useQuery({
    queryKey: ["check-user-access"],
    queryFn: async () => {
      const authToken = await getAccessToken();
      const action = "check_user_access";
      const response = await fetchAPI(
        apiUrl + (action ? `?action=${action}` : ""),
        { action: "CHECK_USER_ACCESS" },
        { Authorization: `Bearer ${authToken}` },
      );

      if (response.status === 401) {
        console.log("401 Response", response);
        toast.error("You do not have access to edit this website. Please contact administrator");
        await logout("UNAUTHORIZED");
        throw new Error("Unauthorized");
      }

      return response;
    },
    refetchInterval: checkInterval * 1000,
    refetchIntervalInBackground: true,
    retry: false,
  });
};

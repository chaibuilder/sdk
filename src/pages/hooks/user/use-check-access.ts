import { fetchAPI } from "@/pages/utils/fetch-api";
import { noop } from "lodash-es";
import { useEffect } from "react";
import { toast } from "sonner";
import { useApiUrl, usePagesProp } from "../project/use-builder-prop";

/**
 * Hook to periodically check if the user has access to the app
 * @param checkInterval Interval in seconds (default 300 = 5 mins)
 */
export const useCheckUserAccess = (checkInterval: number = 300) => {
  const logout = usePagesProp("onLogout", noop);
  const getAccessToken = usePagesProp("getAccessToken");
  const apiUrl = useApiUrl();

  useEffect(() => {
    const checkAccess = async () => {
      const authToken = await getAccessToken();
      try {
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
          return null;
        }
      } catch (error) {
        console.error("Error checking user access:", error);
      }
    };
    // Check immediately on mount
    checkAccess();
    // Set up interval
    const intervalId = setInterval(checkAccess, checkInterval * 1000);

    return () => clearInterval(intervalId);
  }, [checkInterval, apiUrl]);
};

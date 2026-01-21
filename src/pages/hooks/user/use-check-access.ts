import { useFetch } from "@/pages/hooks/utils/use-fetch";
import { useEffect } from "react";
import { useApiUrl } from "../project/use-builder-prop";

/**
 * Hook to periodically check if the user has access to the app
 * @param checkInterval Interval in seconds (default 300 = 5 mins)
 */
export const useCheckUserAccess = (checkInterval: number = 300) => {
  const apiUrl = useApiUrl();
  const fetchAPI = useFetch();

  useEffect(() => {
    const checkAccess = async () => {
      await fetchAPI(apiUrl, { action: "CHECK_USER_ACCESS" });
    };
    // Check immediately on mount
    checkAccess();
    // Set up interval
    const intervalId = setInterval(checkAccess, checkInterval * 1000);

    return () => clearInterval(intervalId);
  }, [fetchAPI, checkInterval, apiUrl]);
};

import { useEffect } from "react";
import { useBuilderFetch } from "@/pages/hooks/utils/use-fetch";

/**
 * Hook to periodically check if the user has access to the app
 * @param checkInterval Interval in seconds (default 300 = 5 mins)
 */
export const useCheckUserAccess = (checkInterval: number = 300) => {
  const fetchAPI = useBuilderFetch();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        await fetchAPI({
          body: { action: "CHECK_USER_ACCESS" },
        });
      } catch (error) {
        // If the action returns 401, useFetch handles logout.
        // But if we want to be extra safe or handle other errors:
        console.error("Error checking user access:", error);
      }
    };

    // Check immediately on mount
    checkAccess();

    // Set up interval
    const intervalId = setInterval(checkAccess, checkInterval * 1000);

    return () => clearInterval(intervalId);
  }, [fetchAPI, checkInterval]);
};

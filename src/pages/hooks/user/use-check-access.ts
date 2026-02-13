import { fetchAPI } from "@/pages/utils/fetch-api";
import { useQuery } from "@tanstack/react-query";
import { noop } from "lodash-es";
import { toast } from "sonner";
import { useApiUrl, usePagesProp } from "../project/use-builder-prop";

type CheckUserAccessResponse = {
  access: boolean;
  role: string;
  permissions: string[] | null;
};

/**
 * Hook to periodically check if the user has access to the app
 * Also returns the user's role and permissions
 * @param checkInterval Interval in seconds (default 300 = 5 mins)
 * @returns Object with access, role, permissions, and loading states
 */
export const useCheckUserAccess = (checkInterval: number = 300) => {
  const logout = usePagesProp("onLogout", noop);
  const getAccessToken = usePagesProp("getAccessToken");
  const apiUrl = useApiUrl();

  return useQuery<CheckUserAccessResponse>({
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

/**
 * Hook to get the user's role and permissions
 * This wraps useCheckUserAccess and returns only role and permissions data
 * Maintained for backward compatibility
 * 
 * Note: Unlike the original implementation, this hook benefits from periodic
 * access checks (every 5 minutes) performed by useCheckUserAccess. This ensures
 * role and permission data stays fresh and helps detect if user access is revoked.
 */
export const useUserRoleAndPermissions = () => {
  const { data, isLoading, error } = useCheckUserAccess();
  
  return {
    data: data ? { role: data.role, permissions: data.permissions } : undefined,
    isLoading,
    isFetching: false, // For backward compatibility, don't expose background refetching
    error,
  };
};

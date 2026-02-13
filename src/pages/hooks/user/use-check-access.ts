import { useQuery } from "@tanstack/react-query";
import { noop } from "lodash-es";
import { toast } from "sonner";
import { usePagesProp } from "../project/use-builder-prop";
import { useFetch } from "../utils/use-fetch";

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
  const fetchAPI = useFetch();

  return useQuery<CheckUserAccessResponse>({
    queryKey: ["check-user-access"],
    queryFn: async () => {
      try {
        const response = await fetchAPI(undefined, {
          action: "CHECK_USER_ACCESS",
          data: {},
        });

        if (!response) {
          throw new Error("No response from server");
        }

        return response;
      } catch (error) {
        console.log("Error checking user access", error);
        toast.error("You do not have access to edit this website. Please contact administrator");
        await logout("UNAUTHORIZED");
        throw error;
      }
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
 * 
 * The isFetching property is always false for backward compatibility, as the
 * original hook used staleTime: Infinity and never refetched after initial load.
 */
export const useUserRoleAndPermissions = () => {
  const { data, isLoading, error } = useCheckUserAccess();
  
  return {
    data: data ? { role: data.role, permissions: data.permissions } : undefined,
    isLoading,
    isFetching: false, // Always false to match original behavior (staleTime: Infinity)
    error,
  };
};

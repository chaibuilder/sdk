import { useQuery } from "@tanstack/react-query";
import { ACTIONS } from "@/pages/constants/ACTIONS";
import { useApiUrl } from "@/pages/hooks/project/use-builder-prop";
import { useChaiAuth } from "@/pages/hooks/use-chai-auth";
import { useFetch } from "@/pages/hooks/utils/use-fetch";

export const useUserRoleAndPermissions = () => {
  const apiUrl = useApiUrl();
  const fetchAPI = useFetch();
  const { user: chaiUser } = useChaiAuth();
  const userId = chaiUser?.id;
  return useQuery({
    queryKey: [ACTIONS.GET_ROLE_AND_PERMISSIONS, userId],
    queryFn: () =>
      fetchAPI(apiUrl, {
        action: ACTIONS.GET_ROLE_AND_PERMISSIONS,
        data: {},
      }),
    enabled: !!userId,
    staleTime: Infinity,
  });
};

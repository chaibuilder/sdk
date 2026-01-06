import { useQuery } from "@tanstack/react-query";
import { ACTIONS } from "../../constants/ACTIONS";
import { useUsersApiUrl } from "../project/use-builder-prop";
import { useChaiAuth } from "../use-chai-auth";
import { useFetch } from "../utils/use-fetch";

export const useUserRoleAndPermissions = () => {
  const usersApiUrl = useUsersApiUrl();
  const fetchAPI = useFetch();
  const { user: chaiUser } = useChaiAuth();
  const userId = chaiUser?.id;
  return useQuery({
    queryKey: [ACTIONS.GET_ROLE_AND_PERMISSIONS, userId],
    queryFn: () =>
      fetchAPI(usersApiUrl, {
        action: ACTIONS.GET_ROLE_AND_PERMISSIONS,
        data: { userId: userId },
      }),
    enabled: !!userId,
    staleTime: Infinity,
  });
};

import { useQuery } from "@tanstack/react-query";
import { isEmpty } from "lodash-es";
import { ACTIONS } from "../../constants/ACTIONS";
import { useUsersApiUrl } from "../project/use-builder-prop";
import { useFetch } from "./use-fetch";

export const useChaiUserInfo = (currentEditor: string) => {
  const usersApiUrl = useUsersApiUrl();
  const fetchAPI = useFetch();
  return useQuery({
    queryKey: [ACTIONS.GET_CHAI_USER, currentEditor],
    queryFn: async () => {
      const data = await fetchAPI(usersApiUrl, {
        action: ACTIONS.GET_CHAI_USER,
        data: { userId: currentEditor },
      });
      const userInfo = data as {
        id: string;
        name: string;
        email: string;
        avatar: string;
      };
      return { ...userInfo, name: userInfo.name || userInfo.email };
    },
    enabled: !isEmpty(currentEditor),
    staleTime: "static",
  });
};

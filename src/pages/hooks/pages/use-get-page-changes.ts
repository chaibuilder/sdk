import { ACTIONS } from "@/pages/constants/ACTIONS";
import { useApiUrl } from "@/pages/hooks/project/use-builder-prop";
import { useFetch } from "@/pages/hooks/utils/use-fetch";
import { useQuery } from "@tanstack/react-query";

export const useGetPageChanges = () => {
  const apiUrl = useApiUrl();
  const fetchAPI = useFetch();
  return useQuery({
    queryKey: [ACTIONS.GET_CHANGES],
    queryFn: async () => {
      return fetchAPI(apiUrl, { action: ACTIONS.GET_CHANGES });
    },
  });
};

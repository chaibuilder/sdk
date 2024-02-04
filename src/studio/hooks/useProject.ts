import { useQuery } from "@tanstack/react-query";
import { useApiBaseUrl } from "./useApiBaseUrl.ts";
import { useCurrentPage } from "./useCurrentPage.ts";
import { fetchWrapper } from "../fetch.ts";

export const useProject = (): any => {
  const [currentPage, setCurrentPage] = useCurrentPage();
  const baseUrl = useApiBaseUrl();
  return useQuery({
    queryKey: ["project"],
    queryFn: async () => {
      const { data: project } = await fetchWrapper.get(`${baseUrl}/project`).then((res) => res.json());
      if (!currentPage && project) {
        const currentPage = localStorage.getItem("currentPage");
        setCurrentPage(currentPage ? currentPage : project?.homepage);
      }
      return project;
    },
  });
};

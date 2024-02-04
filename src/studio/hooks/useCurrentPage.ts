import { useQuery } from "@tanstack/react-query";

export const useCurrentPage = () => {
  const { data: currentPage, refetch } = useQuery({
    queryKey: ["currentPage"],
    queryFn: () => localStorage.getItem("currentPage") || "",
  });

  return [
    currentPage,
    (_currentPage: string) => {
      if (_currentPage) {
        localStorage.setItem("currentPage", _currentPage || "");
        refetch();
      }
    },
  ] as const;
};

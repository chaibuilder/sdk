import { useQuery } from "@tanstack/react-query";

export const useUser = (): any => {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const user = localStorage.getItem("__chai_ur");
      return user ? JSON.parse(user) : null;
    },
  });
};

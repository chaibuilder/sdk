import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiBaseUrl } from "../hooks/useApiBaseUrl.ts";
import { fetchWrapper } from "../fetch.ts";

export const useUpdateProject = (message = "Project updated successfully."): any => {
  const queryClient = useQueryClient();
  const baseUrl = useApiBaseUrl();
  return useMutation({
    mutationFn: async (payload: any) => await fetchWrapper.put(`${baseUrl}/project`, payload).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project"] });
      toast.success(message);
    },
  });
};

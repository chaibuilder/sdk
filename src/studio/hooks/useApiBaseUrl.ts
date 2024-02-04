import { useQueryClient } from "@tanstack/react-query";

export function useApiBaseUrl() {
  const queryClient = useQueryClient();
  return queryClient.getQueryData(["apiBaseUrl"]) || "/api/chaibuilder";
}

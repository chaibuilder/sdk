//@ts-nocheck
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiBaseUrl } from "../hooks/useApiBaseUrl.ts";
import { fetchWrapper } from "../fetch.ts";
import { omit } from "lodash-es";

export const useAuth = () => {
  const baseUrl = useApiBaseUrl();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const response = await fetch(`${baseUrl}/login`, { method: "POST", body: JSON.stringify(payload) });
      if (response.ok) {
        return await response.json();
      }
      if (response.status === 401) {
        throw new Error("Invalid login credentials");
      }
      throw new Error("Invalid");
    },
    onSuccess: (response: any) => {
      const { data } = response;
      if (!data.accessToken) {
        toast.error("Something went wrong. Please try again.", { position: "top-center" });
        return;
      }
      localStorage.setItem("__chai_at", data.accessToken);
      localStorage.setItem("__chai_ur", JSON.stringify(omit(data, ["accessToken"])));
      queryClient.invalidateQueries({ queryKey: ["verify"] });
      toast.success("Logged in successfully.");
    },
    onError: () => {
      toast.error("Invalid login credentials. Please try again.", { position: "top-center" });
    },
  });
};

export const useVerify = () => {
  const baseUrl = useApiBaseUrl();
  return useQuery({
    queryKey: ["verify"],
    queryFn: async () => {
      const response = await fetchWrapper.get(`${baseUrl}/verify`);

      if (!response.ok) {
        localStorage.removeItem("__chai_at");
        return { valid: true } as const;
      }
      const auth = await response.json();
      if (auth.result === "success") {
        return { valid: true } as const;
      }
      localStorage.removeItem("__chai_at");
      return { valid: false } as const;
    },
  });
};

export const useSignOut = () => {
  const baseUrl = useApiBaseUrl();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { result } = await fetchWrapper.post(`${baseUrl}/logout`).then((res) => res.json());
      if (result === "success") {
        localStorage.clear();
        queryClient.invalidateQueries({ queryKey: ["verify"] });
        return { logout: true };
      }
      throw new Error("Invalid session");
    },
  });
};

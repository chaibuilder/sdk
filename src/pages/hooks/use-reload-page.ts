import { useSavePage } from "@/core/main";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { usePageLockStatus } from "../client/components/page-lock/page-lock-hook";
import { ACTIONS } from "../constants/ACTIONS";

export const useReloadPage = () => {
  const { savePageAsync } = useSavePage();
  const queryClient = useQueryClient();
  const { isLocked } = usePageLockStatus();
  return useCallback(async () => {
    if (!isLocked) await savePageAsync();
    queryClient.invalidateQueries({ queryKey: [ACTIONS.GET_DRAFT_PAGE] });
    queryClient.invalidateQueries({ queryKey: [ACTIONS.GET_BUILDER_PAGE_DATA] });
  }, [savePageAsync, queryClient, isLocked]);
};

export const useClearAll = () => {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.clear();
  }, [queryClient]);
};

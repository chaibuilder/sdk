import { ACTIONS } from "@/pages/constants/ACTIONS";
import { usePageEditInfo } from "@/pages/hooks/pages/use-current-page";
import { useApiUrl } from "@/pages/hooks/project/use-builder-prop";
import { ChaiBlock } from "@/types/common";
import { useQueryClient } from "@tanstack/react-query";
import { useFetch } from "./use-fetch";

export const usePagesSavePage = () => {
  const apiUrl = useApiUrl();
  const fetchAPI = useFetch();
  const [, setPageEditInfo] = usePageEditInfo();
  const queryClient = useQueryClient();

  const onSave = async ({
    page,
    blocks,
    needTranslations,
  }: {
    page: string;
    blocks: ChaiBlock[] | any;
    needTranslations?: boolean;
  }) => {
    try {
      const response = await fetchAPI(apiUrl, {
        action: "UPDATE_PAGE",
        data: { id: page, blocks, needTranslations },
      });
      // if response has code and value is PAGE_LOCKED, throw an error
      if (response.code === "PAGE_LOCKED") {
        return true;
      }
      setPageEditInfo((prev) => ({
        ...prev,
        lastSaved: new Date().toISOString(),
      }));
      queryClient.setQueryData([ACTIONS.GET_LANGUAGE_PAGES, page], (oldData: any[] | undefined) => {
        if (!oldData) return oldData;
        return oldData?.map((item: any) => (item?.id === page ? { ...item, changes: ["Page"] } : item));
      });
      queryClient.setQueryData([ACTIONS.GET_WEBSITE_PAGES], (oldData: any[] | undefined) => {
        if (!oldData) return oldData;
        return oldData?.map((item: any) => (item?.id === page ? { ...item, changes: ["Page"] } : item));
      });

      return response;
    } catch (error) {
      console.error(error);
      return new Error("Failed to save blocks");
    }
  };

  return { onSave };
};

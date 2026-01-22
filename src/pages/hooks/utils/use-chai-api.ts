import { usePageEditInfo } from "@/pages/hooks/pages/use-current-page";
import { useApiUrl } from "@/pages/hooks/project/use-builder-prop";
import { ChaiBlock } from "@/types/common";
import { useFetch } from "./use-fetch";

export const usePagesSavePage = () => {
  const apiUrl = useApiUrl();
  const fetchAPI = useFetch();
  const [, setPageEditInfo] = usePageEditInfo();

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
      return response;
    } catch (error) {
      console.error(error);
      return new Error("Failed to save blocks");
    }
  };

  return { onSave };
};

import { toast } from "sonner";
import { useBuilderReset } from "../../core/main";
import { useCurrentPage } from "./useCurrentPage.ts";
import { useTranslation } from "react-i18next";

export const useChangePage = () => {
  const [saveState] = ["SAVED"];
  const [currentPageUid, setCurrentPage] = useCurrentPage();
  const resetBuilder = useBuilderReset();
  const { t } = useTranslation();
  return (page: any) => {
    if (saveState !== "SAVED") {
      toast.error(t("You have unsaved changes. Please save before changing the page."));
      return false;
    }
    if (currentPageUid === page.uuid) return false;
    resetBuilder();
    setTimeout(() => setCurrentPage(page.uuid), 100);
    return true;
  };
};

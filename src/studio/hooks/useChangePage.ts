import { toast } from "sonner";
import { useBuilderReset } from "../../core/main";
import { useCurrentPage } from "./useCurrentPage.ts";

export const useChangePage = () => {
  const [syncStatus] = ["SAVED"];
  const [currentPageUid, setCurrentPage] = useCurrentPage();
  const resetBuilder = useBuilderReset();
  return (page: any) => {
    if (syncStatus !== "SAVED") {
      toast.error("You have unsaved changes. Please save before changing the page.");
      return false;
    }
    if (currentPageUid === page.uuid) return false;
    resetBuilder();
    setTimeout(() => {
      setCurrentPage(page.uuid);
    }, 100);
    return true;
  };
};

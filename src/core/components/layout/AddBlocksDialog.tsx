import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../ui";
import { useTranslation } from "react-i18next";
import AddBlocksPanel from "../sidepanels/panels/add-blocks/AddBlocks.tsx";
import { isEmpty } from "lodash-es";
import { useAddBlocksModal } from "../../hooks/useAddBlocks.ts";

export const AddBlocksDialog = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useAddBlocksModal();

  return (
    <AlertDialog open={!isEmpty(open)} onOpenChange={() => (open ? setOpen("") : "")}>
      <AlertDialogContent className="max-h-[80vh] max-w-5xl overflow-hidden">
        <AlertDialogHeader>
          <AlertDialogTitle>{t("add_block")}</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="no-scrollbar h-[500px] max-h-full overflow-hidden">
          <AddBlocksPanel showHeading={false} />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("Close")}</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

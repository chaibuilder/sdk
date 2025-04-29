import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/shadcn/components/ui/alert-dialog";
import { Button } from "@/ui/shadcn/components/ui/button";
import { useTranslation } from "react-i18next";

export const CopyBlocksAlert = ({
  showPartialDialog,
  setShowPartialDialog,
  handleOnlyCopy,
  handleCloneAndCopy,
}: {
  showPartialDialog: boolean;
  setShowPartialDialog: (show: boolean) => void;
  handleOnlyCopy: () => void;
  handleCloneAndCopy: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <AlertDialog open={showPartialDialog} onOpenChange={setShowPartialDialog}>
      <AlertDialogContent className="max-w-xs p-4">
        <AlertDialogHeader>
          <AlertDialogTitle>{t("Partial blocks detected")}</AlertDialogTitle>
          <AlertDialogDescription>{t("Clone partial blocks?")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button size="sm" variant="outline" onClick={handleOnlyCopy}>
              {t("Only copy")}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button size="sm" variant="default" onClick={handleCloneAndCopy}>
              {t("Clone & copy")}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

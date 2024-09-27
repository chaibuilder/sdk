import { useTranslation } from "react-i18next";
import { useCallback } from "react";
import { EraserIcon } from "@radix-ui/react-icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from "../../../../ui";
import { useSelectedBlockIds, useSelectedStylingBlocks } from "../../../hooks";
import { useBlocksStoreUndoableActions } from "../../../history/useBlocksStoreUndoableActions.ts";

export const ClearCanvas = () => {
  const { t } = useTranslation();
  const { setNewBlocks } = useBlocksStoreUndoableActions();
  const [, setIds] = useSelectedBlockIds();
  const [, setStyleIds] = useSelectedStylingBlocks();
  const clearCanvas = useCallback(() => {
    setNewBlocks([]);
    setIds([]);
    setStyleIds([]);
  }, [setNewBlocks]);

  return (
    <div className="flex items-center">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="ghost" className="flex items-center gap-x-1">
            <EraserIcon /> {t("Clear")}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className={"border-border"}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">{t("Clear Canvas")}</AlertDialogTitle>
            <AlertDialogDescription>{t("Are you sure you want to clear the page?")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-foreground">{t("Cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={clearCanvas}>{t("Yes")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

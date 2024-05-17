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
import { useCanvasHistory, useSelectedBlockIds, useSelectedStylingBlocks, useSetAllBlocks } from "../../../hooks";

export const ClearCanvas = () => {
  const { t } = useTranslation();
  const [setAllBlocks] = useSetAllBlocks();
  const { createSnapshot } = useCanvasHistory();
  const [, setIds] = useSelectedBlockIds();
  const [, setStyleIds] = useSelectedStylingBlocks();
  const clearCanvas = useCallback(() => {
    setAllBlocks([]);
    setIds([]);
    setStyleIds([]);
    createSnapshot();
  }, [setAllBlocks, createSnapshot]);

  return (
    <div className="flex items-center">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="ghost" className="flex items-center gap-x-1">
            <EraserIcon /> {t("clear")}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("clear_canvas_title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("clear_canvas_description")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={clearCanvas}>{t("yes")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

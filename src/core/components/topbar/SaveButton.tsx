import { Button } from "../../../ui";
import { useSavePage } from "../../hooks";
import { FaCheck } from "react-icons/fa6";
import { useTranslation } from "react-i18next";
import { cn } from "../../functions/Functions.ts";

export const SaveButton = () => {
  const { savePage, saveState } = useSavePage();
  const { t } = useTranslation();

  const button = (
    <Button
      disabled={saveState === "SAVING"}
      onClick={(e) => {
        e.preventDefault();
        savePage();
      }}
      className={cn(
        "flex h-auto w-fit items-center gap-x-2 p-1 px-2",
        // UNSAVED sate
        "bg-gray-200 text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400",
        {
          "animate-pulse bg-gray-300 text-gray-900": saveState === "SAVING",
          "bg-green-500 text-white hover:bg-green-600 hover:text-white dark:bg-green-600 dark:text-white":
            saveState === "SAVED",
        },
      )}
      size="sm"
      variant="outline">
      <FaCheck className={"text-sm text-white"} />
      <span className={"text-sm"}>
        {saveState === "SAVING" ? t("saving") : saveState === "SAVED" ? t("saved") : t("unsaved")}
      </span>
    </Button>
  );
  return <div className="flex items-center">{button}</div>;
};

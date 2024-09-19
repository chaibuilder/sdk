import { useMemo } from "react";
import { Button } from "../../../ui";
import { useBuilderProp, useSavePage } from "../../hooks";
import { FaCheck } from "react-icons/fa6";
import { useTranslation } from "react-i18next";

export const SaveButton = () => {
  const { savePage, saveState } = useSavePage();
  const hideButton = useBuilderProp("hideSaveButton", false);
  const { t } = useTranslation();
  const classes = useMemo(() => {
    switch (saveState) {
      case "SAVING":
        return "animate-pulse bg-gray-300 text-gray-900";
      case "SAVED":
        return "bg-green-500 text-white hover:bg-green-600 hover:text-white";
      default:
        return "bg-gray-200 text-gray-500 hover:bg-gray-100";
    }
  }, [saveState]);

  if (hideButton) {
    return null;
  }

  const button = (
    <Button
      disabled={saveState === "SAVING"}
      onClick={(e) => {
        e.preventDefault();
        savePage();
      }}
      className={`flex h-auto w-fit items-center gap-x-2 p-1 px-2 ${classes}`}
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

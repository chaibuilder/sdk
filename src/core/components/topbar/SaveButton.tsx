import { useMemo } from "react";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "../../../ui";
import { useSavePage, useTranslation } from "../../hooks";

export const SaveButton = () => {
  const { savePage, syncState } = useSavePage();
  const { t } = useTranslation();

  const classes = useMemo(() => {
    switch (syncState) {
      case "SAVING":
        return "animate-pulse bg-gray-500 text-gray-900";
      case "SAVED":
        return "bg-green-500 text-white hover:bg-green-600 hover:text-white";
      default:
        return "bg-gray-200 text-gray-500 hover:bg-gray-100";
    }
  }, [syncState]);

  //BUG: on save the selection is lost
  return (
    <div className="flex items-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={(e) => {
              e.preventDefault();
              savePage();
            }}
            className={`flex h-auto w-20 items-center gap-x-1 rounded-full p-1 px-2 ${classes}`}
            size="sm"
            variant="outline">
            <svg fill="currentColor" width="16" height="16" viewBox="0 0 0.32 0.32" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                d="M.274.086a.02.02 0 0 1 0 .028l-.12.12a.02.02 0 0 1-.028 0l-.06-.06A.02.02 0 0 1 .094.146L.14.192.246.086a.02.02 0 0 1 .028 0Z"
              />
            </svg>
            {syncState === "SAVING" ? "Saving..." : syncState === "SAVED" ? t("Saved") : "Save"}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{syncState === "SAVING" ? "Saving..." : syncState === "SAVED" ? "Saved" : "Save changes"}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

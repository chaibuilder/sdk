import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/shadcn/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { ResetIcon } from "@radix-ui/react-icons";
import { useResetBlockStyles } from "@/core/hooks";
import { useTranslation } from "react-i18next";

export const ResetStylesButton = () => {
  const { resetAll } = useResetBlockStyles();
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="ml-1 rounded-sm p-0.5 hover:bg-blue-300 hover:text-blue-600"
          onClick={(e) => e.stopPropagation()}>
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" className="border-border text-xs">
        <DropdownMenuItem
          className="flex items-center gap-1 text-xs"
          onClick={() => {
            resetAll();
          }}>
          <ResetIcon className="h-4 w-4" />
          {t("Reset styles")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

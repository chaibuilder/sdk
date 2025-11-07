import { CHAI_BUILDER_EVENTS } from "@/core/events";
import { useSelectedBlockIds } from "@/core/hooks";
import { pubsub } from "@/core/pubsub";
import { DropdownMenuItem } from "@/ui/shadcn/components/ui/dropdown-menu";
import { DownloadIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";

export const ExportCode = () => {
  const { t } = useTranslation();
  const [selectedIds] = useSelectedBlockIds();
  return (
    <DropdownMenuItem
      className="flex items-center gap-x-4 text-xs"
      onClick={() => pubsub.publish(CHAI_BUILDER_EVENTS.OPEN_EXPORT_CODE, selectedIds)}>
      <DownloadIcon /> {t("Export")}
    </DropdownMenuItem>
  );
};

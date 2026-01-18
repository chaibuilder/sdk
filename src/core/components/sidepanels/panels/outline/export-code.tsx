import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { CHAI_BUILDER_EVENTS } from "@/core/events";
import { useBuilderProp } from "@/core/hooks/use-builder-prop";
import { useSelectedBlockIds } from "@/core/hooks/use-selected-blockIds";
import { pubsub } from "@/core/pubsub";
import { DownloadIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";

export const ExportCode = () => {
  const { t } = useTranslation();
  const [selectedIds] = useSelectedBlockIds();
  const exportCodeEnabled = useBuilderProp("flags.exportCode", false);

  if (!exportCodeEnabled) {
    return null;
  }

  return (
    <DropdownMenuItem
      className="flex items-center gap-x-4 text-xs"
      onClick={() => pubsub.publish(CHAI_BUILDER_EVENTS.OPEN_EXPORT_CODE, selectedIds)}>
      <DownloadIcon /> {t("Export")}
    </DropdownMenuItem>
  );
};

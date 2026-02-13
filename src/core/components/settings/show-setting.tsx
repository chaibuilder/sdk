import { Switch } from "@/components/ui/switch";
import { useSelectedBlock } from "@/hooks/use-selected-blockIds";
import { useUpdateBlocksProps } from "@/hooks/use-update-blocks-props";
import { has } from "lodash-es";
import { useTranslation } from "react-i18next";

export const ShowSetting = () => {
  const { t } = useTranslation();
  const selectedBlock = useSelectedBlock();
  const updateBlockProps = useUpdateBlocksProps();
  const onToggleShow = () => {
    if (!selectedBlock) return;
    updateBlockProps([selectedBlock._id], { _show: has(selectedBlock, "_show") ? !selectedBlock._show : false });
  };
  if (!selectedBlock) return null;
  return (
    <div className="my-2 flex items-center justify-between">
      <p className="text-xs text-gray-500">{t("Visibility")}</p>
      <Switch checked={has(selectedBlock, "_show") ? selectedBlock._show : true} onCheckedChange={onToggleShow} />
    </div>
  );
};

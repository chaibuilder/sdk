import { Button } from "@/components/ui/button";
import { useBuilderProp } from "@/core/hooks/use-builder-prop";
import { usePreviewMode } from "@/core/hooks/use-preview-mode";
import { EyeOpenIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";

export const Preview = function Preview() {
  const preview = useBuilderProp("previewComponent", false);
  const [, setPreviewMode] = usePreviewMode();
  const { t } = useTranslation();
  if (!preview) return null;
  return (
    <Button
      onClick={(e) => {
        e.preventDefault();
        setPreviewMode(true);
      }}
      className={`flex h-auto w-fit items-center gap-x-2 p-1 px-2`}
      size="sm"
      variant="outline">
      <EyeOpenIcon className={"text-xs"} />
      <span className={"text-sm"}>{t("Preview")}</span>
    </Button>
  );
};

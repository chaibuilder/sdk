import { useBuilderProp, usePreviewMode } from "../../hooks";
import { Button } from "../../../ui";
import { useTranslation } from "react-i18next";
import { EyeOpenIcon } from "@radix-ui/react-icons";

export const Preview = function Preview() {
  const preview = useBuilderProp("previewComponent");
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
      <span className={"text-sm"}>{t("preview")}</span>
    </Button>
  );
};

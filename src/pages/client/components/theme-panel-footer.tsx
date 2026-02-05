import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useUpdateWebsiteFields } from "@/pages/hooks/project/mutations";
import { useTranslation } from "react-i18next";

const ThemePanelFooter = () => {
  const [theme] = useTheme();
  const { mutateAsync: updateTheme, isPending } = useUpdateWebsiteFields();
  const { t } = useTranslation();

  const handleThemeSave = () => {
    updateTheme({ settings: { theme } });
  };

  return (
    <div className="flex items-center justify-center gap-x-3 border-t bg-white py-3">
      <Button className="min-w-28" size="sm" disabled={isPending} onClick={handleThemeSave}>
        {t("Save")}
      </Button>
    </div>
  );
};

export default ThemePanelFooter;

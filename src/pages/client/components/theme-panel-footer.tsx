import { Button } from "@/components/ui/button";
import { useTheme, useTranslation } from "@/core/main";
import { usePublishPages } from "@/pages/hooks/pages/mutations";
import { useUpdateWebsiteSettings } from "@/pages/hooks/project/mutations";
import { throwConfetti } from "@/pages/utils/confetti";

const ThemePanelFooter = () => {
  const [theme] = useTheme();
  const { mutate: publishPage, isPending: isPublishing } = usePublishPages();
  const { mutateAsync: updateTheme, isPending } = useUpdateWebsiteSettings();
  const { t } = useTranslation();

  const handleThemeSave = () => {
    updateTheme({ settings: { theme } });
  };

  const handleThemePublish = async () => {
    await updateTheme({ settings: { theme } });
    publishPage(
      { ids: ["THEME"] },
      {
        onSuccess: () => {
          throwConfetti("BOTTOM_RIGHT");
        },
      },
    );
  };

  return (
    <div className="flex items-center justify-center gap-x-3 border-t bg-white py-3">
      <Button size="sm" variant="outline" disabled={isPublishing || isPending} onClick={handleThemeSave}>
        {t("Save draft")}
      </Button>
      <Button size="sm" disabled={isPublishing || isPending} onClick={handleThemePublish}>
        {t("Publish")}
      </Button>
    </div>
  );
};

export default ThemePanelFooter;

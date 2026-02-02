"use client";
import { Button } from "@/components/ui/button";
import type { WebsiteSettings } from "@/types/types";
import { Loader, Save } from "lucide-react";
import { useActionState } from "react";
import { useTranslation } from "react-i18next";
import { useReloadPage } from "@/pages/hooks/use-reload-page";
import { useUpdateWebsiteSettings } from "@/pages/hooks/use-website-settings";

interface SaveButtonProps {
  hasChanges: boolean;
  data: WebsiteSettings;
  showSave: boolean;
  onSaveSuccess?: (data: WebsiteSettings) => void;
}

export default function SaveButton({ hasChanges, data, showSave = true, onSaveSuccess }: SaveButtonProps) {
  const { t } = useTranslation();
  const reloadPage = useReloadPage();
  const { mutateAsync: updateWebsiteSettings } = useUpdateWebsiteSettings();

  // * Save action
  const [, handleSave, isSaving] = useActionState(async (_prevState: unknown, _formData: FormData) => {
    try {
      if (typeof data?.settings !== "object") return { success: false };
      const socialLinks = data?.settings?.socialLinks || {};
      Object.keys(socialLinks).forEach((link) => {
        if (socialLinks && !socialLinks[link]) {
          delete socialLinks[link];
        }
      });

      const updates: Partial<WebsiteSettings> = {
        name: data?.name,
        languages: data?.languages,
        settings: {
          ...data?.settings,
          socialLinks: socialLinks,
        },
      };
      const isLanguageUpdate = (data as any)?.isLanguageUpdate;

      const result = await updateWebsiteSettings({
        ...updates,
        isLanguageUpdate: Boolean(isLanguageUpdate),
      });

      if (result?.success) {
        if (onSaveSuccess) {
          onSaveSuccess({ ...data } as WebsiteSettings);
        }
        reloadPage();
      }
      return result;
    } catch (error: any) {
      return { success: false, error: error?.message };
    }
  }, null);

  return (
    <div className="flex justify-start gap-4">
      {showSave && (
        <form action={handleSave}>
          <Button size="sm" className="w-40" type="submit" variant="default" disabled={isSaving || !hasChanges}>
            {isSaving ? (
              <>
                <Loader className="h-3 w-3 animate-spin" />
                {t("Saving")}
              </>
            ) : (
              <>
                <Save className="h-3 w-3" />
                {t("Save Draft")}
              </>
            )}
          </Button>
        </form>
      )}
    </div>
  );
}

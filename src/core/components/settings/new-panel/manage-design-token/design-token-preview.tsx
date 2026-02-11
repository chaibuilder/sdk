import { ScrollArea } from "@/components/ui/scroll-area";
import { sanitizeClasses } from "@/core/functions/SanitizeClasses";
import { useTranslation } from "react-i18next";

interface DesignTokenPreviewProps {
  activeToken?: {
    name: string;
    value: string;
    id?: string;
  } | null;
}

export const DesignTokenPreview = ({ activeToken }: DesignTokenPreviewProps) => {
  const { t } = useTranslation();

  if (!activeToken || !activeToken.name || !activeToken.value) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-muted bg-muted/10 p-8">
        <div className="text-center">
          <p className="mb-2 text-sm font-medium text-muted-foreground">{t("No token selected")}</p>
          <p className="text-xs text-muted-foreground">{t("Select or create a token to see the preview")}</p>
        </div>
      </div>
    );
  }

  // Sanitize token value to prevent XSS attacks
  const safeTokenValue = sanitizeClasses(activeToken.value);

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 pr-4">
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground">{t("Token Preview")}</h4>
          <p className="text-[10px] text-muted-foreground">
            {t("Live preview of the selected token")}
          </p>
        </div>

        <div className="space-y-2 rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">{activeToken.name}</span>
            {activeToken.id && (
              <span className="rounded bg-muted px-2 py-0.5 text-[9px] font-mono text-muted-foreground">
                {activeToken.id}
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-[10px] font-medium text-muted-foreground mb-1">{t("Classes:")}</div>
              <code className="text-[10px] rounded bg-muted/50 px-2 py-1 block">{activeToken.value}</code>
            </div>

            <div>
              <div className="text-[10px] font-medium text-muted-foreground mb-2">{t("Preview:")}</div>
              <div className={safeTokenValue}>
                {t("Sample text with token styles applied")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

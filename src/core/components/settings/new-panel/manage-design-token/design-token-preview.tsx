import { chaiDesignTokensAtom } from "@/atoms/builder";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sanitizeClasses } from "@/core/functions/SanitizeClasses";
import { useAtom } from "jotai";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const PREVIEW_LABEL_WIDTH = "w-16";

export const DesignTokenPreview = () => {
  const { t } = useTranslation();
  const [designTokens] = useAtom(chaiDesignTokensAtom);

  const tokenEntries = useMemo(() => Object.entries(designTokens), [designTokens]);

  if (tokenEntries.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-muted bg-muted/10 p-8">
        <div className="text-center">
          <p className="mb-2 text-sm font-medium text-muted-foreground">{t("No tokens to preview")}</p>
          <p className="text-xs text-muted-foreground">{t("Create a design token to see it previewed here")}</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 pr-4">
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground">{t("Token Styles")}</h4>
          <p className="text-[10px] text-muted-foreground">
            {t("Preview of how your design tokens will appear when applied to elements")}
          </p>
        </div>

        <div className="space-y-3">
          {tokenEntries.map(([tokenId, token]) => {
            // Sanitize token value to prevent XSS attacks
            const safeTokenValue = sanitizeClasses(token.value);
            
            return (
              <div key={tokenId} className="space-y-2 rounded-lg border bg-card p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">{token.name}</span>
                  <span className="rounded bg-muted px-2 py-0.5 text-[9px] font-mono text-muted-foreground">
                    {tokenId}
                  </span>
                </div>

                <div className="text-[10px] text-muted-foreground">
                  <code className="rounded bg-muted/50 px-1 py-0.5">{token.value}</code>
                </div>

                {/* Preview Examples */}
                <div className="space-y-2 pt-2">
                  <div className="text-[10px] font-medium text-muted-foreground">{t("Preview:")}</div>

                  {/* Button Preview */}
                  <div className="flex items-center gap-2">
                    <div className={`text-[9px] text-muted-foreground ${PREVIEW_LABEL_WIDTH}`}>{t("Button")}:</div>
                    <button className={`${safeTokenValue} rounded px-3 py-1.5 text-xs`}>
                      {t("Sample Button")}
                    </button>
                  </div>

                  {/* Text Preview */}
                  <div className="flex items-center gap-2">
                    <div className={`text-[9px] text-muted-foreground ${PREVIEW_LABEL_WIDTH}`}>{t("Text")}:</div>
                    <div className={`${safeTokenValue} text-sm`}>{t("Sample text with token styles")}</div>
                  </div>

                  {/* Box Preview */}
                  <div className="flex items-center gap-2">
                    <div className={`text-[9px] text-muted-foreground ${PREVIEW_LABEL_WIDTH}`}>{t("Box")}:</div>
                    <div className={`${safeTokenValue} rounded p-3 text-xs min-w-[120px]`}>
                      {t("Sample box")}
                    </div>
                  </div>

                  {/* Card Preview */}
                  <div className="flex items-center gap-2">
                    <div className={`text-[9px] text-muted-foreground ${PREVIEW_LABEL_WIDTH}`}>{t("Card")}:</div>
                    <div className={`${safeTokenValue} rounded-lg p-4 text-xs min-w-[150px]`}>
                      <div className="font-semibold">{t("Card Title")}</div>
                      <div className="text-[10px] mt-1">{t("Card content area")}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
};

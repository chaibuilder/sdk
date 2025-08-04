import * as React from "react";
import { Button } from "@/ui/shadcn/components/ui/button";
import { Textarea } from "@/ui/shadcn/components/ui/textarea";
import { Upload } from "lucide-react";
import {
  parseToChaiThemeValues,
  validateCssInput,
  validateChaiThemeValues,
} from "@/core/utils/css-theme-parser";
import { ChaiThemeValues } from "@/types/chaibuilder-editor-props";
import { useTranslation } from "react-i18next";

interface CssImportPanelProps {
  onImport: (themeValues: ChaiThemeValues) => void;
}

export const CssImportModal: React.FC<CssImportPanelProps> = ({ onImport }) => {
  const [cssText, setCssText] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const { t } = useTranslation();

  const handleImport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const validation = validateCssInput(cssText);
      if (!validation.isValid) {
        setError(validation.error || "Invalid CSS format");
        setTimeout(() => setError(null), 5000);
        setIsLoading(false);
        return;
      }

      const parsedTheme = parseToChaiThemeValues(cssText);

      if (!validateChaiThemeValues(parsedTheme)) {
        setError(
          "The CSS doesn't contain enough theme information. Please ensure it includes at least background, foreground, primary, and primary-foreground colors."
        );
        setTimeout(() => setError(null), 5000);
        setIsLoading(false);
        return;
      }

      onImport(parsedTheme);
      setCssText("");
    } catch (err) {
      console.error("Error importing CSS:", err);
      setError("Failed to parse CSS. Please check your syntax and try again.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        id="css-input"
        placeholder={`Paste theme JSON here...`}
        value={cssText}
        onChange={(e) => setCssText(e.target.value)}
        className="h-20 text-xs font-mono resize-none"
        disabled={isLoading}
      />
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-2">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
      <Button
        size="sm"
        className="w-full h-8 text-xs"
        onClick={handleImport}
        disabled={!cssText.trim() || isLoading}
      >
        <Upload className="w-3 h-3 mr-1" />
        {isLoading ? t("Importing...") : t("Import Theme")}
      </Button>
    </div>
  );
};

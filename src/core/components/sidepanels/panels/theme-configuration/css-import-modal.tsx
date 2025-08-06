import * as React from "react";
import { Button } from "@/ui/shadcn/components/ui/button";
import { Label } from "@/ui/shadcn/components/ui/label";
import { Textarea } from "@/ui/shadcn/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/shadcn/components/ui/dialog";
import { parseToChaiThemeValues, validateCssInput, validateChaiThemeValues } from "@/core/utils/css-theme-parser";
import { ChaiThemeValues } from "@/types/chaibuilder-editor-props";
import { useTranslation } from "react-i18next";

interface CssImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (themeValues: ChaiThemeValues) => void;
}

const CSS_PLACEHOLDER = `:root {
  --background: 0 0% 100%;
  --foreground: oklch(0.52 0.13 144.17);
  --primary: #3e2723;
  --primary-foreground: #ffffff;
  }

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: hsl(37.50 36.36% 95.69%);
  --primary: rgb(46, 125, 50);
  --primary-foreground: #ffffff;
}`;

export const CssImportModal: React.FC<CssImportModalProps> = ({
  open,
  onOpenChange,
  onImport,
}) => {
  const [cssText, setCssText] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const { t } = useTranslation();

  const handleImport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Basic validation - check if the CSS contains some expected variables
      const validation = validateCssInput(cssText);
      if (!validation.isValid) {
        setError(validation.error || "Invalid CSS format");
        setTimeout(() => {
          setError(null);
        }, 5000);
        setIsLoading(false);
        return;
      }

      // Parse CSS to ChaiThemeValues
      const parsedTheme = parseToChaiThemeValues(cssText);
      
      // Validate the parsed theme
      if (!validateChaiThemeValues(parsedTheme)) {
        setError("The CSS doesn't contain enough theme information. Please ensure it includes at least background, foreground, primary, and primary-foreground colors.");
        setTimeout(() => {
          setError(null);
        }, 5000);
        setIsLoading(false);
        return;
      }

      // Apply the theme
      onImport(parsedTheme);
      setCssText("");
      setError(null);
      onOpenChange(false);
    } catch (err) {
      console.error("Error importing CSS:", err);
      setError("Failed to parse CSS. Please check your syntax and try again.");
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setCssText("");
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t("Import CSS Theme")}</DialogTitle>
          <DialogDescription>
            {t("Paste your CSS variables to import a custom theme. The CSS should contain :root and .dark blocks with CSS custom properties.")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 space-y-4 overflow-hidden">
          <div className="space-y-2">
            <Label htmlFor="css-input">{t("CSS Variables")}</Label>
            <Textarea
              id="css-input"
              placeholder={CSS_PLACEHOLDER}
              value={cssText}
              onChange={(e) => setCssText(e.target.value)}
              className="min-h-[300px] font-mono text-sm resize-none"
              disabled={isLoading}
            />
          </div>
          
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {t("Cancel")}
          </Button>
          <Button
            onClick={handleImport}
            disabled={!cssText.trim() || isLoading}
          >
            {isLoading ? t("Importing...") : t("Import Theme")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

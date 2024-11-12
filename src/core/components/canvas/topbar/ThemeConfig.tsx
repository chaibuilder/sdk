import * as React from "react";
import { Paintbrush } from "lucide-react";
import { useBrandingOptions } from "../../../hooks";
import { useTranslation } from "react-i18next";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "../../../../ui/shadcn/components/ui/dialog";
import { Label } from "../../../../ui/shadcn/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../../ui/shadcn/components/ui/tabs";

import { cn } from "../../../functions/Functions";
import { BorderRadiusInput, FontSelector, ColorPickerInput, ThemePreview } from "./ThemeComponents";

interface ThemeConfigProps {
  className?: string;
}

export const ThemeConfig: React.FC<ThemeConfigProps> = React.memo(({ className = "" }) => {
  const [open, setOpen] = React.useState(false);
  const [brandingOptions, setBrandingOptions] = useBrandingOptions();
  const { t } = useTranslation();

  // Memoize the update function
  const updateBrandingOptions = React.useCallback(
    (updates: Partial<typeof brandingOptions>) => {
      setBrandingOptions((prev) => ({ ...prev, ...updates }));
    },
    [setBrandingOptions],
  );

  // Destructure values with defaults
  const {
    bodyFont = "Inter",
    headingFont = "Inter",
    primaryColor = "#3b82f6",
    secondaryColor = "#10b981",
    bodyTextDarkColor = "#ffffff",
    bodyTextLightColor = "#000000",
    bodyBgDarkColor = "#112937",
    bodyBgLightColor = "#ffffff",
    roundedCorners = "4",
  } = brandingOptions;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex cursor-pointer items-center gap-x-1">
          <Paintbrush className="h-4 w-4" />
          <span className="sr-only">{t("Open theme configuration")}</span>
        </div>
      </DialogTrigger>
      <DialogContent className={cn("max-w-fit", className)}>
        <DialogHeader>
          <DialogTitle>{t("Website Theme Configuration")}</DialogTitle>
        </DialogHeader>
    
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">{t("Theme Config.Fonts")}</h4>
            <div className="grid grid-cols-2 gap-4">
              <FontSelector
                label={t("Theme Config.Heading Font")}
                value={headingFont}
                onChange={(value) => updateBrandingOptions({ headingFont: value })}
                placeholder={t("Theme Config.Select heading font")}
              />
              <FontSelector
                label={t("Theme Config.Body Font")}
                value={bodyFont}
                onChange={(value) => updateBrandingOptions({ bodyFont: value })}
                placeholder={t("Theme Config.Select body font")}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">{t("Theme Config.Colors")}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("Theme Config.Primary")}</Label>
                <ColorPickerInput value={primaryColor} onChange={(value) => updateBrandingOptions({ primaryColor: value })} />
              </div>
              <div className="space-y-2">
                <Label>{t("Theme Config.Secondary")}</Label>
                <ColorPickerInput
                  value={secondaryColor}
                  onChange={(value) => updateBrandingOptions({ secondaryColor: value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">{t("Theme Config.Border Radius")}</h4>
            <div className="flex items-center gap-4">
              <BorderRadiusInput onChange={(value) => updateBrandingOptions({ roundedCorners: value })} />
              <span className="w-12 text-sm">{roundedCorners}px</span>
            </div>
          </div>

          <Tabs defaultValue="light">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="light">{t("Theme Config.Light Mode")}</TabsTrigger>
              <TabsTrigger value="dark">{t("Theme Config.Dark Mode")}</TabsTrigger>
            </TabsList>
            <TabsContent value="light" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("Theme Config.Background")}</Label>
                  <ColorPickerInput
                    value={bodyBgLightColor}
                    onChange={(value) => updateBrandingOptions({ bodyBgLightColor: value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("Theme Config.Text Color")}</Label>
                  <ColorPickerInput
                    value={bodyTextLightColor}
                    onChange={(value) => updateBrandingOptions({ bodyTextLightColor: value })}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="dark" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("Theme Config.Background")}</Label>
                  <ColorPickerInput
                    value={bodyBgDarkColor}
                    onChange={(value) => updateBrandingOptions({ bodyBgDarkColor: value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("Theme Config.Text Color")}</Label>
                  <ColorPickerInput
                    value={bodyTextDarkColor}
                    onChange={(value) => updateBrandingOptions({ bodyTextDarkColor: value })}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* <div className="space-y-4">
            <h4 className="text-sm font-medium">{t("Theme Config.Preview")}</h4>
            <div className="grid grid-cols-2 gap-4">
              <ThemePreview
                mode="Light"
                bgColor={bodyBgLightColor}
                textColor={bodyTextLightColor}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                roundedCorners={roundedCorners}
                headingFont={headingFont}
                bodyFont={bodyFont}
                t={t}
              />
              <ThemePreview
                mode="Dark"
                bgColor={bodyBgDarkColor}
                textColor={bodyTextDarkColor}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                roundedCorners={roundedCorners}
                headingFont={headingFont}
                bodyFont={bodyFont}
                t={t}
              />
            </div>
          </div> */}
        </div>
      </DialogContent>
    </Dialog>
  );
});

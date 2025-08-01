import {
  BorderRadiusInput,
  ColorPickerInput,
  FontSelector,
} from "@/core/components/sidepanels/panels/theme-configuration";
import { cn } from "@/core/functions/common-functions";
import { lazy, Suspense } from "react";
import { useDarkMode } from "@/core/hooks";
import { useBuilderProp } from "@/core/hooks/index";
import { usePermissions } from "@/core/hooks/use-permissions";
import { useTheme, useThemeOptions } from "@/core/hooks/use-theme";
import { ChaiThemeValues } from "@/types/chaibuilder-editor-props";
import { Button } from "@/ui/shadcn/components/ui/button";
import { Label } from "@/ui/shadcn/components/ui/label";
import { useDebouncedCallback } from "@react-hookz/web";
import { capitalize, get, set } from "lodash-es";
import { ImportIcon, Undo, X } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const LazyCssImportModal = lazy(() =>
  import("./CssImportModal").then((module) => ({ default: module.CssImportModal })),
);

// Local storage key for storing previous theme
const PREV_THEME_KEY = "chai-builder-previous-theme";

const setPreviousTheme = (theme: ChaiThemeValues) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREV_THEME_KEY, JSON.stringify(theme));
  } catch (error) {
    console.warn("Failed to save previous theme to localStorage:", error);
  }
};

const clearPreviousTheme = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PREV_THEME_KEY);
  } catch (error) {
    console.warn("Failed to clear previous theme from localStorage:", error);
  }
};

interface ThemeConfigProps {
  className?: string;
}

const ThemeConfigPanel: React.FC<ThemeConfigProps> = React.memo(({ className = "" }) => {
  const [isDarkMode] = useDarkMode();
  const [selectedPreset, setSelectedPreset] = React.useState<string>("");
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const themePresets = useBuilderProp("themePresets", []);
  const themePanelComponent = useBuilderProp("themePanelComponent", null);
  const { hasPermission } = usePermissions();

  const [themeValues, setThemeValues] = useTheme();
  const chaiThemeOptions = useThemeOptions();
  const { t } = useTranslation();
  const setThemeWithHistory = React.useCallback(
    (newTheme: ChaiThemeValues) => {
      const previousTheme = { ...themeValues };
      setPreviousTheme(previousTheme);
      setThemeValues(newTheme);
      toast.success("Theme updated", {
        action: {
          label: (
            <span className="flex items-center gap-2">
              <Undo className="h-4 w-4" /> Undo
            </span>
          ),
          onClick: () => {
            setThemeValues(previousTheme);
            clearPreviousTheme();
            toast.dismiss();
          },
        },
        closeButton: true,
        duration: 15000,
      });
    },
    [themeValues, setThemeValues],
  );
  const handlePresetChange = (presetName: string) => {
    setSelectedPreset(presetName);
  };

  const applyPreset = () => {
    const preset = (themePresets as any[]).find((p) => Object.keys(p)[0] === selectedPreset);
    if (preset) {
      const newThemeValues = Object.values(preset)[0] as ChaiThemeValues;
      if (
        newThemeValues &&
        typeof newThemeValues === "object" &&
        "fontFamily" in newThemeValues &&
        "borderRadius" in newThemeValues &&
        "colors" in newThemeValues
      ) {
        setThemeWithHistory(newThemeValues);
      } else {
        console.error("Invalid preset structure:", newThemeValues);
      }
    } else {
      console.error("Preset not found:", selectedPreset);
    }
  };

  const handleCssImport = (importedTheme: ChaiThemeValues) => {
    // Apply the imported theme values directly to the current theme
    setThemeWithHistory(importedTheme);
    setSelectedPreset("");
  };

  const handleFontChange = useDebouncedCallback(
    (key: string, newValue: string) => {
      setThemeValues(() => ({
        ...themeValues,
        fontFamily: {
          ...themeValues.fontFamily,
          [key.replace(/font-/g, "")]: newValue,
        },
      }));
    },
    [themeValues],
    200,
  );

  const handleBorderRadiusChange = useDebouncedCallback(
    (value: string) => {
      setThemeValues(() => ({
        ...themeValues,
        borderRadius: `${value}px`,
      }));
    },
    [themeValues],
    200,
  );

  const handleColorChange = useDebouncedCallback(
    (key: string, newValue: string) => {
      setThemeValues(() => {
        const prevColor = get(themeValues, `colors.${key}`);
        if (!isDarkMode) {
          set(prevColor, 0, newValue);
        } else {
          set(prevColor, 1, newValue);
        }
        return {
          ...themeValues,
          colors: {
            ...themeValues.colors,
            [key]: prevColor,
          },
        };
      });
    },
    [themeValues],
    200,
  );

  const renderColorGroup = (group: any) => (
    <div className="grid grid-cols-1">
      {Object.entries(group.items).map(([key]: [string, [string, string]]) => {
        const themeColor = get(themeValues, `colors.${key}.${isDarkMode ? 1 : 0}`);
        if (!themeColor) return null;
        return (
          <div key={key} className="mt-1 flex items-center gap-x-2">
            <ColorPickerInput
              value={themeColor as string}
              onChange={(newValue: string) => handleColorChange(key, newValue)}
            />
            <Label className="text-xs font-normal leading-tight">
              {key
                .split(/(?=[A-Z])/)
                .join(" ")
                .replace(/-/g, " ")
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ") +
                (!key.toLowerCase().includes("foreground") &&
                !key.toLowerCase().includes("border") &&
                !key.toLowerCase().includes("input") &&
                !key.toLowerCase().includes("ring") &&
                !key.toLowerCase().includes("background")
                  ? " Background"
                  : "")}
            </Label>
          </div>
        );
      })}
    </div>
  );

  if (!hasPermission("edit_theme")) {
    return (
      <div className="relative w-full">
        <div className={cn("no-scrollbar h-full w-full overflow-y-auto text-center", className)}>
          <div className="mt-10 h-full items-center justify-center gap-2 text-muted-foreground">
            <p className="text-sm">
              You don't have permission to edit the theme. Please contact your administrator to get access.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className={cn("no-scrollbar h-full w-full overflow-y-auto", className)}>
        {themePresets.length > 0 && (
          <div className="flex flex-col gap-1 py-2">
            <div className="flex w-full items-center justify-between">
              <Label className="text-sm">{t("Presets")}</Label>
              <div className="flex gap-2">
                <Button className="px-1" variant="link" size="sm" onClick={() => setIsImportModalOpen(true)}>
                  <ImportIcon className="h-4 w-4" />
                  {t("Import theme")}
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-[70%]">
                <select
                  value={selectedPreset}
                  onChange={(e) => handlePresetChange(e.target.value)}
                  className="w-full space-y-0.5 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <option value="">Select preset</option>
                  {Array.isArray(themePresets) &&
                    themePresets.map((preset: any) => (
                      <option key={Object.keys(preset)[0]} value={Object.keys(preset)[0]}>
                        {capitalize(Object.keys(preset)[0].replaceAll("_", " "))}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex w-[30%] items-end">
                <Button
                  className="w-full text-sm"
                  disabled={selectedPreset === ""}
                  variant="default"
                  onClick={applyPreset}>
                  {t("Apply")}
                </Button>
              </div>
            </div>
          </div>
        )}
        <div className={cn("space-y-2", className)}>
          {/* Fonts Section */}
          {chaiThemeOptions?.fontFamily && (
            <div className="grid gap-4">
              {Object.entries(chaiThemeOptions.fontFamily).map(([key, value]: [string, any]) => (
                <FontSelector
                  key={key}
                  label={key}
                  value={themeValues.fontFamily[key.replace(/font-/g, "")] || value[Object.keys(value)[0]]}
                  onChange={(newValue: string) => handleFontChange(key, newValue)}
                />
              ))}
            </div>
          )}

          {/* Border Radius Section */}
          {chaiThemeOptions?.borderRadius && (
            <div className="space-y-0.5 py-3">
              <Label className="text-sm">{t("Border Radius")}</Label>
              <div className="flex items-center gap-4 py-2">
                <BorderRadiusInput value={themeValues.borderRadius} onChange={handleBorderRadiusChange} />
                <span className="w-12 text-sm">{themeValues.borderRadius}</span>
              </div>
            </div>
          )}

          {/* Colors Section with Mode Switch */}
          {chaiThemeOptions?.colors && (
            <div className="mt-4 space-y-0.5">
              <Label className="text-sm">{t("Colors")}</Label>
              <div className="w-full space-y-4 pt-2" key={isDarkMode ? "dark" : "light"}>
                {chaiThemeOptions.colors.map((group) => renderColorGroup(group))}
              </div>
            </div>
          )}
        </div>
        <br />
        <br />
        <br />
        <br />
      </div>

      {themePanelComponent && (
        <div className="absolute bottom-4 w-full">{React.createElement(themePanelComponent)}</div>
      )}

      <Suspense fallback={<div>Loading...</div>}>
        {isImportModalOpen && (
          <LazyCssImportModal open={isImportModalOpen} onOpenChange={setIsImportModalOpen} onImport={handleCssImport} />
        )}
      </Suspense>
    </div>
  );
});

export default ThemeConfigPanel;

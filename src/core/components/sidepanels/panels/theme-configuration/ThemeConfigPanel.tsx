import * as React from "react";

import { useTranslation } from "react-i18next";
import { Button, Label } from "../../../../../ui";
import { cn } from "../../../../functions/Functions.ts";
import { useDarkMode } from "../../../../hooks";
import { useBuilderProp } from "../../../../hooks/index.ts";
import { useTheme, useThemeOptions } from "../../../../hooks/useTheme.ts";
import { BorderRadiusInput, ColorPickerInput, FontSelector } from "./index.ts";

import { useDebouncedCallback } from "@react-hookz/web";
import { capitalize, get, set } from "lodash-es";
import { usePermissions } from "../../../../hooks/usePermissions.ts";
import { ChaiBuilderThemeValues } from "../../../../types/chaiBuilderEditorProps.ts";
interface ThemeConfigProps {
  className?: string;
}

const ThemeConfigPanel: React.FC<ThemeConfigProps> = React.memo(({ className = "" }) => {
  const [isDarkMode] = useDarkMode();
  const [selectedPreset, setSelectedPreset] = React.useState<string>("");
  const themePresets = useBuilderProp("themePresets", []);
  const themePanelComponent = useBuilderProp("themePanelComponent", null);
  const { hasPermission } = usePermissions();

  const [themeValues, setThemeValues] = useTheme();

  const chaiThemeOptions = useThemeOptions();

  const { t } = useTranslation();

  const handlePresetChange = (presetName: string) => {
    setSelectedPreset(presetName);
  };

  const applyPreset = () => {
    const preset = (themePresets as any[]).find((p) => Object.keys(p)[0] === selectedPreset);
    if (preset) {
      const newThemeValues = Object.values(preset)[0] as ChaiBuilderThemeValues;
      if (
        newThemeValues &&
        typeof newThemeValues === "object" &&
        "fontFamily" in newThemeValues &&
        "borderRadius" in newThemeValues &&
        "colors" in newThemeValues
      ) {
        setThemeValues(newThemeValues);
      } else {
        console.error("Invalid preset structure:", newThemeValues);
      }
    } else {
      console.error("Preset not found:", selectedPreset);
    }
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
        return (
          <div key={key} className="mt-1 flex items-center gap-x-2">
            <ColorPickerInput
              value={themeColor as string}
              onChange={(newValue: string) => handleColorChange(key, newValue)}
            />
            <Label className="text-xs font-normal leading-tight text-slate-600">
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
          <div className="flex gap-2 py-2">
            <div className="w-full">
              <Label className="text-sm text-slate-800">{t("Presets")}</Label>
              <select
                value={selectedPreset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full space-y-0.5 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <option value="">Select preset</option>
                {Array.isArray(themePresets) &&
                  themePresets.map((preset: any) => (
                    <option key={Object.keys(preset)[0]} value={Object.keys(preset)[0]}>
                      {capitalize(Object.keys(preset)[0])}
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
              <Label className="text-sm text-slate-800">{t("Border Radius")}</Label>
              <div className="flex items-center gap-4 py-2">
                <BorderRadiusInput value={themeValues.borderRadius} onChange={handleBorderRadiusChange} />
                <span className="w-12 text-sm">{themeValues.borderRadius}</span>
              </div>
            </div>
          )}

          {/* Colors Section with Mode Switch */}
          {chaiThemeOptions?.colors && (
            <div className="mt-4 space-y-0.5">
              <Label className="text-sm text-slate-800">{t("Colors")}</Label>
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
    </div>
  );
});

export default ThemeConfigPanel;

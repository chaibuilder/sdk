import * as React from "react";

import { useBuilderProp } from "../../../../hooks/index.ts";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ScrollArea,
  Button,
  Switch,
} from "../../../../../ui";
import { cn } from "../../../../functions/Functions.ts";
import { BorderRadiusInput, FontSelector, ColorPickerInput } from "./index.ts";
import { useTheme, useThemeOptions } from "../../../../hooks/useTheme.ts";
import { Sun, Moon } from "lucide-react";
import { get, set } from "lodash";

interface ThemeConfigProps {
  className?: string;
}

const ThemeConfigPanel: React.FC<ThemeConfigProps> = React.memo(({ className = "" }) => {
  const [currentMode, setCurrentMode] = React.useState<"light" | "dark">("light");
  const [selectedPreset, setSelectedPreset] = React.useState<string>("");
  const themePresets = useBuilderProp("themePresets", (presets) => presets) || [];

  const [themeValues, setThemeValues] = useTheme();
  console.log(themeValues);

  const chaiThemeOptions = useThemeOptions();

  const { t } = useTranslation();

  const handlePresetChange = (presetName: string) => {
    setSelectedPreset(presetName);
  };

  const handleFontChange = (key: string, newValue: string) => {
    // if (selectedPreset === "custom") {
    //   setCustomThemeValues((prev: any) => ({
    //     ...prev,
    //     fontFamily: {
    //       ...prev.fontFamily,
    //       [key]: newValue,
    //     },
    //   }));
    // }
  };

  const handleBorderRadiusChange = (value: string) => {
    // if (selectedPreset === "custom") {
    //   setCustomThemeValues((prev: any) => ({
    //     ...prev,
    //     borderRadius: `${value}rem`,
    //   }));
    // }
  };

  const handleColorChange = (key: string, newValue: string) => {
    // console.log(key, newValue);
    setThemeValues(() => {
      const prevColor = get(themeValues, `colors.${key}`);
      if (currentMode === "light") {
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
  };

  const renderColorGroup = (group: any) => (
    <div className="grid grid-cols-1">
      {Object.entries(group.items).map(([key]: [string, [string, string]]) => {
        const themeColor = get(themeValues, `colors.${key}.${currentMode === "light" ? 0 : 1}`);
        return (
          <div key={key} className="flex items-center">
            <ColorPickerInput
              value={themeColor as string}
              onChange={(newValue: string) => handleColorChange(key, newValue)}
            />
            &nbsp;&nbsp;
            <Label className="text-xs text-muted-foreground">
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

  return (
    <ScrollArea className={cn("h-full w-full", className)}>
      <div className="hidden gap-2">
        <div className="w-[70%]">
          <Label className="text-sm font-bold">{t("Presets")}</Label>
          <select
            value={selectedPreset}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <option value="">Select preset</option>
            {Array.isArray(themePresets) &&
              themePresets.map((preset: any) => (
                <option key={Object.keys(preset)[0]} value={Object.keys(preset)[0]}>
                  {Object.keys(preset)[0]}
                </option>
              ))}
          </select>
        </div>
        <div className="flex w-[30%] items-end">
          <Button className="w-full text-sm" variant="default" onClick={() => {}}>
            {t("Apply")}
          </Button>
        </div>
      </div>
      <br />
      <div className={cn("space-y-2", className)}>
        {/* Fonts Section */}
        {chaiThemeOptions?.fontFamily && (
          <div className="grid gap-4">
            {Object.entries(chaiThemeOptions.fontFamily).map(([key, value]: [string, any]) => (
              <FontSelector
                key={key}
                label={key}
                value={themeValues.fontFamily[key] || value[Object.keys(value)[0]]}
                onChange={(newValue: string) => handleFontChange(key, newValue)}
              />
            ))}
          </div>
        )}

        {/* Border Radius Section */}
        {chaiThemeOptions?.borderRadius && (
          <div className="py-3">
            <h4 className="text-sm font-bold">{t("Border Radius")}</h4>
            <div className="flex items-center gap-4">
              <BorderRadiusInput disabled={selectedPreset === "preset"} onChange={handleBorderRadiusChange} />
              <span className="w-12 text-sm">{themeValues.borderRadius}</span>
            </div>
          </div>
        )}

        {/* Colors Section with Mode Switch */}
        {chaiThemeOptions?.colors && (
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold">{t("Colors")}</h4>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="size-2 transition-all" />
                <Switch
                  checked={currentMode === "dark"}
                  onCheckedChange={(checked) => setCurrentMode(checked ? "dark" : "light")}
                  className="data-[state=checked]:bg-slate-800 data-[state=unchecked]:bg-slate-200"
                />
                <Moon className="size-2" />
              </div>
            </div>

            <Accordion type="multiple" className="w-full space-y-2">
              {chaiThemeOptions.colors.map((group) => renderColorGroup(group))}
            </Accordion>
          </div>
        )}
      </div>
      <br />
      <br />
      <br />
      <br />
    </ScrollArea>
  );
});

export default ThemeConfigPanel;

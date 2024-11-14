import * as React from "react";

import { useBuilderProp } from "../../../../hooks/index.ts";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../../../ui/shadcn/components/ui/accordion.tsx";

import { Label } from "../../../../../ui/shadcn/components/ui/label.tsx";

import { cn } from "../../../../functions/Functions.ts";
import { BorderRadiusInput, FontSelector, ColorPickerInput } from "./index.ts";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../ui/shadcn/components/ui/select";
import { useTheme, useThemeOptions } from "../../../../hooks/useTheme.ts";
import { Switch } from "../../../../../ui/shadcn/components/ui/switch";
import { Button } from "../../../../../ui/shadcn/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { ChaiBuilderThemeValues } from "../../../../types/chaiBuilderEditorProps.ts";
import { ScrollArea } from "../../../../../ui/index.ts";

interface ThemeConfigProps {
  className?: string;
}

const ThemeConfigPanel: React.FC<ThemeConfigProps> = React.memo(({ className = "" }) => {
  const [currentMode, setCurrentMode] = React.useState<"light" | "dark">("light");
  const [selectedPreset, setSelectedPreset] = React.useState<string>("");
  const themePresets = useBuilderProp("themePresets", (presets) => presets) || [];

  const [customThemeValues, setChaiTheme] = useTheme();

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
    // if (selectedPreset === "custom") {
    //   setCustomThemeValues((prev: any) => ({
    //     ...prev,
    //     colors: {
    //       ...prev.colors,
    //       [key]: [
    //         currentMode === "light" ? newValue : prev.colors?.[key]?.[0] || "",
    //         currentMode === "dark" ? newValue : prev.colors?.[key]?.[1] || "",
    //       ],
    //     },
    //   }));
    // }
  };

  const renderColorGroup = (group: any) => (
    <AccordionItem value={group.group} key={group.group}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center space-x-2">
          <span>{group.group}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="grid grid-cols-1 gap-4 bg-white">
          {Object.entries(group.items).map(([key, values]: [string, [string, string]]) => {
            const defaultValue = values[currentMode === "light" ? 0 : 1];
            const themeColor = customThemeValues.colors?.[key]?.[currentMode === "light" ? 0 : 1];

            return (
              <div key={key} className="flex items-center gap-2">
                <ColorPickerInput
                  disabled={selectedPreset === "preset"}
                  value={(themeColor || defaultValue) as string}
                  onChange={(newValue: string) => handleColorChange(key, newValue)}
                />
                <Label>
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
      </AccordionContent>
    </AccordionItem>
  );

  return (
    <ScrollArea className={cn("h-full w-full space-y-6", className)}>
      <div className="flex gap-2">
        <div className="w-[70%]">
          <Label>{t("Presets")}</Label>
          <Select value={selectedPreset} onValueChange={handlePresetChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select preset" />
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(themePresets) &&
                themePresets.map((preset: any) => (
                  <SelectItem key={Object.keys(preset)[0]} value={Object.keys(preset)[0]}>
                    {Object.keys(preset)[0]}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[30%] items-end">
          <Button
            className="w-full text-sm"
            variant="default"
            onClick={() => {
              if (!Array.isArray(themePresets)) return;
              const selectedTheme = themePresets.find((preset: any) => Object.keys(preset)[0] === selectedPreset);
              if (selectedTheme) {
                const themeValues: ChaiBuilderThemeValues = Object.values(selectedTheme)[0];

                setChaiTheme((prev) => ({
                  ...prev,
                  ...themeValues,
                }));
              }
            }}>
            Apply
          </Button>
        </div>
      </div>

      <div className={cn("space-y-6", className)}>
        {/* Fonts Section */}
        {chaiThemeOptions?.fontFamily && (
          <div className="grid gap-4">
            {Object.entries(chaiThemeOptions.fontFamily).map(([key, value]: [string, any]) => (
              <FontSelector
                key={key}
                label={key}
                value={customThemeValues.fontFamily[key] || value[Object.keys(value)[0]]}
                onChange={(newValue: string) => handleFontChange(key, newValue)}
                placeholder={`Select ${key} font`}
                disabled={selectedPreset === "preset"}
              />
            ))}
          </div>
        )}

        {/* Border Radius Section */}
        {chaiThemeOptions?.borderRadius && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium">{t("Border Radius")}</h4>
            <div className="flex items-center gap-4">
              <BorderRadiusInput disabled={selectedPreset === "preset"} onChange={handleBorderRadiusChange} />
              <span className="w-12 text-sm">{customThemeValues.borderRadius}</span>
            </div>
          </div>
        )}

        {/* Colors Section with Mode Switch */}
        {chaiThemeOptions?.colors && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium">{t("Colors")}</h4>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="size-4 transition-all" />
                <Switch
                  checked={currentMode === "dark"}
                  onCheckedChange={(checked) => setCurrentMode(checked ? "dark" : "light")}
                  className="data-[state=checked]:bg-slate-800 data-[state=unchecked]:bg-slate-200"
                />
                <Moon className="size-4" />
              </div>
            </div>

            <Accordion type="multiple" className="w-full">
              {chaiThemeOptions.colors.map((group) => renderColorGroup(group))}
            </Accordion>
          </div>
        )}
      </div>
    </ScrollArea>
  );
});

export default ThemeConfigPanel;

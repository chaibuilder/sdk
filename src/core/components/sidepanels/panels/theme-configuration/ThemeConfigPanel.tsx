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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../../../ui/shadcn/components/ui/tabs.tsx";

import { cn } from "../../../../functions/Functions.ts";
import { BorderRadiusInput, FontSelector, ColorPickerInput } from "./index.ts";
import { ChaiBuilderThemeOptions } from "../../../../types/chaiBuilderEditorProps.ts";
import { useAtom } from "jotai";
import { customThemeValuesAtom, defaultThemeValues } from "../../../../atoms/theme.ts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../ui/shadcn/components/ui/select";

interface ThemeConfigProps {
  className?: string;
}

const defaultThemeStructure: ChaiBuilderThemeOptions = {
  fontFamily: {},
  borderRadius: {},
  colors: [],
};

const ThemeConfigPanel: React.FC<ThemeConfigProps> = React.memo(({ className = "" }) => {
  const [currentMode, setCurrentMode] = React.useState<"light" | "dark">("light");
  const [configMode, setConfigMode] = React.useState<"preset" | "custom">("custom");
  const [customThemeValues, setCustomThemeValues] = useAtom(customThemeValuesAtom);

  // Get the active theme values based on the mode
  const activeThemeValues = configMode === "preset" ? defaultThemeValues : customThemeValues;

  const getThemeFromProps = useBuilderProp("themeOptions", (themeOptions: ChaiBuilderThemeOptions) => themeOptions);
  const activeThemeOptions: ChaiBuilderThemeOptions = getThemeFromProps(defaultThemeStructure);

  const { t } = useTranslation();

  // Handle switching between preset and custom
  const handleConfigModeChange = (mode: "preset" | "custom") => {
    setConfigMode(mode);
    if (mode === "custom" && !customThemeValues) {
      // Initialize custom theme with default values if not set
      setCustomThemeValues({ ...defaultThemeValues });
    }
  };

  // Only allow changes when in custom mode
  const handleFontChange = (key: string, newValue: string) => {
    if (configMode === "custom") {
      setCustomThemeValues((prev) => ({
        ...prev,
        fontFamily: {
          ...prev.fontFamily,
          [key]: newValue,
        },
      }));
    }
  };

  const handleBorderRadiusChange = (value: string) => {
    if (configMode === "custom") {
      setCustomThemeValues((prev) => ({
        ...prev,
        borderRadius: `${value}rem`,
      }));
    }
  };

  const handleColorChange = (key: string, newValue: string) => {
    if (configMode === "custom") {
      setCustomThemeValues((prev) => ({
        ...prev,
        colors: {
          ...prev.colors,
          [key]: {
            ...prev.colors[key],
            [currentMode]: newValue,
          },
        },
      }));
    }
  };

  // Updated group rendering function
  const renderColorGroup = (group: any) => (
    <AccordionItem value={group.group} key={group.group}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center space-x-2">
          <span>{group.group}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="grid grid-cols-1 gap-4 bg-white">
          {Object.entries(group.items[currentMode]).map(([key, value]: [string, any]) => {
            const cssVariable = Object.values(value)[0];
            const colorKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
            const themeColor = activeThemeValues.colors[colorKey]?.[currentMode];

            return (
              <div key={key} className="space-y-2">
                <Label>{key}</Label>
                <ColorPickerInput
                  disabled={configMode === "preset"}
                  value={(themeColor || cssVariable) as string}
                  onChange={(newValue: string) => handleColorChange(colorKey, newValue)}
                />
              </div>
            );
          })}
        </div>
      </AccordionContent>
    </AccordionItem>
  );

  return (
    <div className={cn("h-full w-full space-y-6", className)}>
      {/* Theme Configuration Mode Selector */}
      <div className="space-y-2">
        <Label>{t("Configuration Mode")}</Label>
        <Select value={configMode} onValueChange={handleConfigModeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="preset">{t("Preset Theme")}</SelectItem>
            <SelectItem value="custom">{t("Custom Theme")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Theme Configuration Form */}
      <div className={cn("space-y-6", className)}>
        {/* Fonts Section */}
        {activeThemeOptions?.fontFamily && (
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(activeThemeOptions.fontFamily).map(([key, value]: [string, any]) => (
              <FontSelector
                key={key}
                label={key}
                value={activeThemeValues.fontFamily[key] || value[Object.keys(value)[0]]}
                onChange={(newValue: string) => handleFontChange(key, newValue)}
                placeholder={`Select ${key} font`}
                disabled={configMode === "preset"}
              />
            ))}
          </div>
        )}

        {/* Border Radius Section */}
        {activeThemeOptions?.borderRadius && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium">{t("Border Radius")}</h4>
            <div className="flex items-center gap-4">
              <BorderRadiusInput
                disabled={configMode === "preset"}
                onChange={handleBorderRadiusChange}
              />
              <span className="w-12 text-sm">{activeThemeValues.borderRadius}</span>
            </div>
          </div>
        )}

        {/* Colors Section with Tabs */}
        {activeThemeOptions?.colors && (
          <div className="space-y-4">
            <Tabs
              defaultValue="light"
              className="w-full"
              onValueChange={(value) => setCurrentMode(value as "light" | "dark")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="light">{t("Light Mode")}</TabsTrigger>
                <TabsTrigger value="dark">{t("Dark Mode")}</TabsTrigger>
              </TabsList>
              <TabsContent value="light" className="space-y-6">
                <Accordion type="multiple" className="w-full">
                  {activeThemeOptions.colors.map((group) => renderColorGroup(group))}
                </Accordion>
              </TabsContent>
              <TabsContent value="dark" className="space-y-6">
                <Accordion type="multiple" className="w-full">
                  {activeThemeOptions.colors.map((group) => renderColorGroup(group))}
                </Accordion>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
});

export default ThemeConfigPanel;

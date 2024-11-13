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
import { themeValuesAtom } from "../../../../atoms/theme.ts";

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

  const getThemeFromProps = useBuilderProp("themeOptions", (themeOptions: ChaiBuilderThemeOptions) => themeOptions);
  const [themeValues, setThemeValues] = useAtom(themeValuesAtom);

  const activeThemeOptions: ChaiBuilderThemeOptions = getThemeFromProps(defaultThemeStructure);

  const { t } = useTranslation();

  // Font update handler
  const handleFontChange = (key: string, newValue: string) => {
    setThemeValues((prev) => ({
      ...prev,
      fontFamily: {
        ...prev.fontFamily,
        [key]: newValue,
      },
    }));
  };

  // Border radius update handler
  const handleBorderRadiusChange = (value: string) => {
    setThemeValues((prev) => ({
      ...prev,
      borderRadius: `${value}rem`,
    }));
  };

  // Color update handler
  const handleColorChange = (key: string, newValue: string) => {
    setThemeValues((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [key]: {
          ...prev.colors[key],
          [currentMode]: newValue,
        },
      },
    }));
  };

  // Group rendering function
  const renderColorGroup = (group: any) => (
    <AccordionItem value={group.group} key={group.group}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center space-x-2">
          <span>{group.group}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="grid grid-cols-1 gap-4 bg-white">
          {Object.entries(group.items).map(([key, value]: [string, any]) => {
            const cssVariable = Object.keys(value)[0];
            const themeColor = themeValues?.colors?.[key]?.[currentMode];

            return (
              <div key={key} className="space-y-2">
                <Label>{key}</Label>
                <ColorPickerInput
                  value={themeColor || value[cssVariable]}
                  onChange={(newValue: string) => handleColorChange(key, newValue)}
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
      {/* Fonts Section */}
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(activeThemeOptions?.fontFamily || {}).map(([key, value]: [string, any]) => (
          <FontSelector
            key={key}
            label={key}
            value={themeValues.fontFamily[key] || value[Object.keys(value)[0]]}
            onChange={(newValue: string) => handleFontChange(key, newValue)}
            placeholder={`Select ${key} font`}
          />
        ))}
      </div>

      {/* Border Radius Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">{t("Border Radius")}</h4>
        <div className="flex items-center gap-4">
          <BorderRadiusInput onChange={handleBorderRadiusChange} />
          <span className="w-12 text-sm">{themeValues.borderRadius}</span>
        </div>
      </div>

      {/* Colors Section with Tabs */}
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
              {Array.isArray(activeThemeOptions?.colors) &&
                activeThemeOptions?.colors?.map((group: any) => renderColorGroup(group))}
            </Accordion>
          </TabsContent>
          <TabsContent value="dark" className="space-y-6">
            <Accordion type="multiple" className="w-full">
              {Array.isArray(activeThemeOptions?.colors) &&
                activeThemeOptions?.colors?.map((group: any) => renderColorGroup(group))}
            </Accordion>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
});

export default ThemeConfigPanel;

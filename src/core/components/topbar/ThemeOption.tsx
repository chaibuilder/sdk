import * as React from "react";
import { Paintbrush } from "lucide-react";
import { useBuilderProp } from "../../hooks";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../ui/shadcn/components/ui/accordion";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "../../../ui/shadcn/components/ui/dialog.tsx";
import { Label } from "../../../ui/shadcn/components/ui/label.tsx";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../ui/shadcn/components/ui/tabs";

import { cn } from "../../functions/Functions.ts";
import { BorderRadiusInput, FontSelector, ColorPickerInput } from "./ThemeConfiguration";
import { ChaiBuilderThemeOptions } from "../../types/chaiBuilderEditorProps.ts";
import { useAtom } from "jotai";
import { themeValuesAtom } from "../../atoms/theme";

interface ThemeConfigProps {
  className?: string;
}

const defaultThemeStructure: ChaiBuilderThemeOptions = {
  fontFamily: {},
  borderRadius: {},
  colors: [],
};

export const ThemeOption: React.FC<ThemeConfigProps> = React.memo(({ className = "" }) => {
  const [open, setOpen] = React.useState(false);
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
        <div className="grid grid-cols-3 gap-4 bg-white">
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex cursor-pointer items-center gap-x-1">
          <Paintbrush className="h-4 w-4" />
          <span className="sr-only">{t("Open theme configuration")}</span>
        </div>
      </DialogTrigger>
      <DialogContent className={cn("max-h-[80vh] max-w-[800px] overflow-y-auto", className)}>
        <DialogHeader>
          <DialogTitle>{t("Website Theme Configuration")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Fonts Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">{t("Fonts")}</h4>
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
      </DialogContent>
    </Dialog>
  );
});

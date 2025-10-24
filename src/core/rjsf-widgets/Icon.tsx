import type { IconName } from "@/components/ui/icon-picker";
import { Icon } from "@/components/ui/icon-picker";
import { Button } from "@/ui/shadcn/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/shadcn/components/ui/dialog";
import { WidgetProps } from "@rjsf/utils";
import { createElement, lazy, Suspense, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { useTranslation } from "react-i18next";

const IconPicker = lazy(() => import("@/components/ui/icon-picker").then((mod) => ({ default: mod.IconPicker })));

const sanitizeSvg = (svgString: string): string => {
  try {
    // Remove width and height attributes
    let cleaned = svgString
      .replace(/<svg([^>]*)\sheight="[^"]*"([^>]*)>/gi, "<svg$1$2>")
      .replace(/<svg([^>]*)\swidth="[^"]*"([^>]*)>/gi, "<svg$1$2>");

    // Remove extra whitespace between tags
    cleaned = cleaned.replace(/>\s+</g, "><");

    // Remove newlines and extra spaces
    cleaned = cleaned.replace(/\n/g, "").replace(/\s{2,}/g, " ");

    // Trim spaces around attributes
    cleaned = cleaned.replace(/\s+=/g, "=").replace(/=\s+/g, "=");

    // Remove comments
    cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, "");

    return cleaned.trim();
  } catch (error) {
    return svgString;
  }
};

const IconPickerField = ({ value, onChange, id }: WidgetProps) => {
  const { t } = useTranslation();
  const [svgInput, setSvgInput] = useState(value || "");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    setSvgInput(value || "");
  }, [value]);

  const handleSvgChange = (newSvg: string) => {
    setSvgInput(newSvg);
    const sanitized = sanitizeSvg(newSvg);
    onChange(sanitized);
  };

  const handleIconSelect = (iconName: IconName) => {
    // Create a temporary div to render the icon and extract SVG
    const tempDiv = document.createElement("div");
    tempDiv.style.display = "none";
    document.body.appendChild(tempDiv);

    // Render the icon into the temp div
    const root = createRoot(tempDiv);
    root.render(createElement(Icon, { name: iconName }));

    // Wait for render and extract SVG
    setTimeout(() => {
      const svgElement = tempDiv.querySelector("svg");

      if (svgElement) {
        const svgString = svgElement.outerHTML;
        const sanitized = sanitizeSvg(svgString);
        setSvgInput(sanitized);
        onChange(sanitized);
      }

      // Cleanup
      root.unmount();
      document.body.removeChild(tempDiv);
    }, 100);

    // Close dialog
    setIsDialogOpen(false);
  };

  return (
    <div className="mt-1 flex flex-col gap-2" id="icon-picker-field">
      <div className="flex items-center gap-x-2">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border bg-gray-50">
          {svgInput ? (
            <div className="h-6 w-6" dangerouslySetInnerHTML={{ __html: svgInput }} />
          ) : (
            <span className="text-xs text-gray-400">SVG</span>
          )}
        </div>
        <textarea
          id={id}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
          value={svgInput}
          onChange={(e) => handleSvgChange(e.target.value)}
          placeholder={t("SVG_code")}
          rows={2}
          className="no-scrollbar w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <div className="flex items-center gap-2">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs">
              {t("Choose Icon")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t("Select an Icon")}</DialogTitle>
              <DialogDescription>{t("Choose an icon from the library to use as SVG")}</DialogDescription>
            </DialogHeader>
            <Suspense fallback={<div className="py-8 text-center">Loading icons...</div>}>
              <IconPicker onValueChange={handleIconSelect} searchable={true} categorized={true} modal={false} />
            </Suspense>
          </DialogContent>
        </Dialog>
        <p className="text-xs text-muted-foreground">{t("Paste SVG_code")}</p>
      </div>
    </div>
  );
};

export { IconPickerField };

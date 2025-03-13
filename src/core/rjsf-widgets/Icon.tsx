import { WidgetProps } from "@rjsf/utils";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const removeSizeAttributes = (svgString: string): string => {
  try {
    return svgString
      .replace(/<svg([^>]*)\sheight="[^"]*"([^>]*)>/gi, "<svg$1$2>")
      .replace(/<svg([^>]*)\swidth="[^"]*"([^>]*)>/gi, "<svg$1$2>");
  } catch (error) {
    return svgString;
  }
};

const IconPickerField = ({ value, onChange, id }: WidgetProps) => {
  const { t } = useTranslation();
  const [svgInput, setSvgInput] = useState(value || "");

  useEffect(() => {
    setSvgInput(value || "");
  }, [value]);

  const handleSvgChange = (newSvg: string) => {
    setSvgInput(newSvg);
    const cleanedSvg = removeSizeAttributes(newSvg);
    onChange(cleanedSvg);
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
          placeholder={t("Enter SVG code here")}
          rows={2}
          className="no-scrollbar w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <p className="text-xs text-muted-foreground">{t("Paste SVG code to use as an icon")}</p>
    </div>
  );
};

export { IconPickerField };

import { WidgetProps } from "@rjsf/utils";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import IconPicker, { IconPickerItem } from "react-icons-picker";

const ICON_PICKER_CONTAINER_ID = "icon-picker-item-container";

const removeSizeAttributes = (svgString: string): string => {
  try {
    return svgString
      .replace(/<svg([^>]*)\sheight="[^"]*"([^>]*)>/gi, "<svg$1$2>")
      .replace(/<svg([^>]*)\swidth="[^"]*"([^>]*)>/gi, "<svg$1$2>");
  } catch (error) {
    return svgString;
  }
};

const getSvgMarkup = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const iconPickerContainer = document.getElementById(ICON_PICKER_CONTAINER_ID);
        let svgMarkup = iconPickerContainer?.innerHTML || "";
        svgMarkup = removeSizeAttributes(svgMarkup);
        resolve(svgMarkup);
      } catch (err) {
        reject(err);
      }
    }, 300);
  });
};

const IconPickerField = ({ value, onChange, id }: WidgetProps) => {
  const { t } = useTranslation();
  const [iconName, setIconName] = useState(null);

  useEffect(() => {
    setIconName(null);
  }, [value]);

  const handleIconChange = async (icon: string) => {
    const lastIcon = iconName;
    try {
      setIconName(icon);
      const svgMarkup = await getSvgMarkup();
      onChange(svgMarkup);
    } catch (error) {
      setIconName(lastIcon);
    }
  };

  return (
    <div className="mt-1 flex h-20 items-center gap-x-2" id="icon-picker-field">
      <div className="relative h-12 w-12 cursor-pointer overflow-hidden rounded-lg border duration-300 hover:bg-gray-100">
        {iconName ? (
          <div
            id={ICON_PICKER_CONTAINER_ID}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
            <IconPickerItem value={iconName} />
          </div>
        ) : value ? (
          <div
            className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 transform"
            dangerouslySetInnerHTML={{ __html: value }}
          />
        ) : (
          <div
            id="icon-picker-item-container"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
            <IconPickerItem value={"BiSolidGrid"} />
          </div>
        )}
        <IconPicker
          value={iconName || value}
          onChange={handleIconChange}
          pickButtonStyle={{
            height: "48px",
            width: "48px",
            opacity: 0,
          }}
          searchInputStyle={{
            backgroundColor: "transparent",
            width: "100%",
            border: "1px solid #BBBBBB",
            margin: "0px 10px",
            padding: "10px",
          }}
        />
      </div>
      <textarea
        id={id}
        autoCapitalize={"off"}
        autoCorrect={"off"}
        spellCheck={"false"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("Choose Icon or SVG")}
        className={
          "no-scrollbar flex w-full rounded-md border border-border bg-background px-3 py-1.5 text-[10px] leading-4 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        }
      />
    </div>
  );
};

export { IconPickerField };

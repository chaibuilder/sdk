import { WidgetProps } from "@rjsf/utils";
import IconPicker, { IconPickerItem } from "react-icons-picker";
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";

const getSvgMarkup = (icon: string) => {
  try {
    const container = document.getElementById("icon-picker-field") as HTMLElement;
    const iconPickerContainer = document.createElement("div");
    ReactDOM.render(<IconPickerItem value={icon} />, iconPickerContainer);
    container.appendChild(iconPickerContainer);

    iconPickerContainer.hidden = true;
    let iconPickerMarkup = iconPickerContainer.innerHTML;
    setTimeout(() => container.removeChild(iconPickerContainer), 100);

    // // * Removing height and width from svg
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(iconPickerMarkup, "image/svg+xml");
    // remove width and height
    const svgElement = svgDoc.querySelector("svg");
    if (svgElement) {
      svgElement.removeAttribute("width");
      svgElement.removeAttribute("height");
    }
    return new XMLSerializer().serializeToString(svgDoc);
  } catch (err) {
    console.error(err);
    return "";
  }
};

const IconPickerField = ({ value, onChange }: WidgetProps) => {
  const { t } = useTranslation();
  const handleIconChange = (icon: string) => {
    onChange("<svg />");
    const svgMarkup = getSvgMarkup(icon);
    onChange(svgMarkup);
  };

  return (
    <div className="mt-1 flex h-20 items-center gap-x-2" id="icon-picker-field">
      <div className="group relative h-12 w-12">
        <div
          dangerouslySetInnerHTML={{
            __html: value ? value.replace("<svg", `<svg class="h-5 w-5"`) : "<svg class='h-5 w-5' />",
          }}
          className="absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 transform cursor-pointer bg-white"
        />
        <IconPicker
          value={value ? "BiSolidGrid" : null}
          onChange={handleIconChange}
          pickButtonStyle={{
            position: "relative",
            height: "48px",
            width: "48px",
            border: "1px solid #999",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "6px",
            backgroundColor: "transparent",
            zIndex: 1,
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
        autoCapitalize={"off"}
        autoCorrect={"off"}
        spellCheck={"false"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("choose_icon_or_enter_svg")}
        className={
          "no-scrollbar disabled:opacity-50; mt-1 flex w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed"
        }
      />
    </div>
  );
};

export { IconPickerField };

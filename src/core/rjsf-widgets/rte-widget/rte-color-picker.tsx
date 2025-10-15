import { lsThemeAtom } from "@/_demo/atoms-dev";
import { cn } from "@/core/utils/cn";
import { Input } from "@/ui";
import { useAtom } from "jotai";
import { get, uniq } from "lodash-es";
import { useEffect, useState } from "react";
import { HexAlphaColorPicker } from "react-colorful";
import RteDropdownMenu from "./rte-dropdown-menu";
import { CaretDownIcon, Cross1Icon } from "@radix-ui/react-icons";
import { useDarkMode } from "@/core/hooks";
import { useDebouncedState } from "@react-hookz/web";

const getActiveClasses = (editor: any, keys: string[] | boolean, from: string) => {
  const isFromSettings = from === "settings";
  const isActive = typeof keys === "boolean" ? keys : keys.some((key) => editor.isActive(key));
  return {
    "rounded p-1": true,
    "hover:bg-blue-900 hover:text-blue-100": !isActive && !isFromSettings,
    "hover:bg-blue-100 hover:text-blue-900": !isActive && isFromSettings,
    "bg-blue-500 text-white": isActive && isFromSettings,
    "bg-white text-blue-500": isActive && !isFromSettings,
  };
};

const Commons = ({ themeColors, onClose, color, onChange, onRemove }: any) => {
  return (
    <>
      <div className="flex w-[180px] flex-wrap gap-1 pb-2">
        {themeColors?.length > 0 &&
          uniq(themeColors).map((hex) => (
            <button
              key={hex}
              className={cn(
                "h-5 w-5 cursor-pointer rounded-full border border-gray-900 shadow hover:opacity-80 hover:shadow-lg",
                {
                  "border-2": hex === color,
                },
              )}
              style={{ backgroundColor: hex }}
              onClick={() => {
                onChange(hex);
                onClose();
              }}
              title={(hex || "#000000")?.toUpperCase()}
            />
          ))}
        <Input
          type="text"
          value={color || "#000000f2"}
          onChange={(e) => onChange(e.target.value, true)}
          className="!h-5 !w-[92px] rounded-sm !p-0 text-center text-xs font-medium uppercase text-gray-600 outline-none"
          placeholder="#000000"
        />
        <button
          className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-red-100 text-red-600 shadow hover:opacity-80 hover:shadow-lg"
          onClick={() => {
            onRemove();
            onClose();
          }}
          title="Remove">
          <Cross1Icon />
        </button>
      </div>
      <HexAlphaColorPicker color={color} onChange={onChange} style={{ width: "200px", height: "200px" }} />
    </>
  );
};

// Common Color Picker Component
const ColorPickerContent = ({
  textColor,
  highlightColor,
  onChangeTextColor,
  onChangeHighlightColor,
  onRemoveTextColor,
  onRemoveHighlightColor,
  onClose,
}: {
  textColor: string;
  highlightColor: string;
  onChangeTextColor: (color: string, isInput?: boolean) => void;
  onChangeHighlightColor: (color: string, isInput?: boolean) => void;
  onRemoveTextColor: () => void;
  onRemoveHighlightColor: () => void;
  onClose: () => void;
}) => {
  const [darkMode] = useDarkMode();
  const [theme]: [any, any] = useAtom(lsThemeAtom);
  const colors = theme?.colors || {};
  const themeColors = Object.values(colors).map((color) => get(color, darkMode ? "1" : "0"));
  const [moreColors, setMoreColors] = useState("TEXT");

  return (
    <div id="rte-widget-color-picker" className="px-1">
      <div className="mb-2 flex items-center justify-between rounded-md border bg-muted">
        <div
          className={`w-full cursor-pointer rounded p-0.5 text-center ${
            moreColors === "TEXT" ? "bg-blue-500 text-white" : "hover:bg-blue-100 hover:text-blue-500"
          }`}
          onClick={() => setMoreColors("TEXT")}>
          Text Color
        </div>
        <div
          className={`w-full cursor-pointer rounded p-0.5 text-center ${
            moreColors === "HIGHLIGHT" ? "bg-blue-500 text-white" : "hover:bg-blue-100 hover:text-blue-500"
          }`}
          onClick={() => setMoreColors("HIGHLIGHT")}>
          Highlight Color
        </div>
      </div>
      {moreColors === "TEXT" ? (
        <Commons
          themeColors={themeColors}
          onClose={onClose}
          onChange={onChangeTextColor}
          color={textColor}
          onRemove={onRemoveTextColor}
        />
      ) : (
        <Commons
          themeColors={themeColors}
          onClose={onClose}
          onChange={onChangeHighlightColor}
          color={highlightColor}
          onRemove={onRemoveHighlightColor}
        />
      )}
    </div>
  );
};

const RteColorPicker = ({ editor, from, menuRef }: { editor: any; from?: "settings" | "canvas"; menuRef: any }) => {
  const currentTextColor = editor?.getAttributes("textStyle")?.color;
  const currentHighlightColor = editor?.getAttributes("highlight")?.color;

  const [textColor, setTextColor] = useState(currentTextColor || "#000000F2");
  const [highlightColor, setHighlightColor] = useState(currentHighlightColor || "#00000057");
  const [debouncedTextColor, setDebouncedTextColor] = useDebouncedState(textColor, 500);
  const [debouncedHighlightColor, setDebouncedHighlightColor] = useDebouncedState(highlightColor, 500);

  const handleTextColorChange = (color: string, isInput?: boolean) => {
    if (isInput) {
      setTextColor(color);
      setDebouncedTextColor(color);
    } else {
      editor?.chain().focus().setColor(color).run();
      setTextColor(color);
    }
  };

  const handleHighlightColorChange = (color: string, isInput?: boolean) => {
    if (isInput) {
      setTextColor(color);
      setDebouncedHighlightColor(color);
    } else {
      editor?.chain().focus().toggleHighlight({ color }).run();
      setHighlightColor(color);
    }
  };

  const handleRemoveTextColor = () => {
    editor?.chain().focus().unsetColor().run();
    setTextColor("#000000F2");
  };

  const handleRemoveHighlightColor = () => {
    editor?.chain().focus().unsetHighlight().run();
  };

  useEffect(() => {
    if (currentHighlightColor) setHighlightColor(currentHighlightColor);
  }, [currentHighlightColor]);

  useEffect(() => {
    if (debouncedHighlightColor?.includes("#") && debouncedHighlightColor?.length >= 3) {
      editor?.chain().focus().setHighlight({ color: debouncedHighlightColor }).run();
    }
  }, [debouncedHighlightColor]);

  useEffect(() => {
    if (debouncedTextColor?.includes("#") && debouncedTextColor?.length >= 3) {
      editor?.chain().focus().setColor(debouncedTextColor).run();
    }
  }, [debouncedTextColor]);

  return (
    <RteDropdownMenu
      from={from}
      menuRef={menuRef}
      trigger={
        <button
          type="button"
          className={cn("relative flex items-center", getActiveClasses(editor, Boolean(currentTextColor), from))}
          title="Text Color">
          <div
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: from === "canvas" ? "#C0C0C0" : "#000000" }}
          />
          <CaretDownIcon className="h-3 w-3 opacity-50" />
        </button>
      }
      content={(onClose) => (
        <ColorPickerContent
          textColor={textColor}
          highlightColor={highlightColor}
          onChangeTextColor={handleTextColorChange}
          onChangeHighlightColor={handleHighlightColorChange}
          onRemoveTextColor={handleRemoveTextColor}
          onRemoveHighlightColor={handleRemoveHighlightColor}
          onClose={onClose}
        />
      )}
    />
  );
};

export default RteColorPicker;

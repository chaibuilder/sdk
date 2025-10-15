import { lsThemeAtom } from "@/_demo/atoms-dev";
import { cn } from "@/core/utils/cn";
import { Input } from "@/ui";
import { useAtom } from "jotai";
import { get, uniq } from "lodash-es";
import { useEffect, useState } from "react";
import { HexAlphaColorPicker } from "react-colorful";
import RteDropdownMenu from "./menu-bar-dropdown-item";
import { CaretDownIcon } from "@radix-ui/react-icons";
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

const Commons = ({ themeColors, onClose, type, title, color, onChange, onRemove }: any) => {
  const [moreColors, setMoreColors] = useState("TEXT");

  return (
    <>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs font-medium">{title}</div>
        <Input
          type="text"
          value={color || "#000000f2"}
          onChange={(e) => onChange(e.target.value, true)}
          className="!h-5 !w-[85px] !p-0 text-center font-mono text-xs font-medium uppercase text-gray-600"
          placeholder="#000000"
        />
      </div>

      <div className="flex w-[180px] flex-wrap gap-2 pb-2">
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
        <button
          className="relative flex h-5 w-5 cursor-pointer items-center justify-center overflow-hidden rounded-full hover:opacity-80 hover:shadow-lg"
          onClick={() => {
            setMoreColors((prev) => (prev !== type ? type : ""));
          }}
          title="#000000f2">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(#ff0000, #ff5f00, #ffee00, #00ff40, #00ffe7, #0085ff, #7f00ff, #ff00aa, #ff0000)",
              boxShadow: "0 0 100px 40px #b7efd6",
            }}></div>
        </button>
        <button
          className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-gray-500 shadow hover:opacity-80 hover:shadow-lg"
          onClick={() => {
            onRemove();
            onClose();
          }}
          title="Remove">
          <svg className="h-3 w-3" viewBox="0 0 167.751 167.751">
            <path d="M0 83.875c0 46.249 37.626 83.875 83.875 83.875s83.875-37.626 83.875-83.875S130.125 0 83.875 0 0 37.626 0 83.875m83.875 68.876C45.897 152.751 15 121.854 15 83.875c0-16.292 5.698-31.272 15.191-43.078l96.762 96.762c-11.806 9.493-26.785 15.192-43.078 15.192m68.875-68.876c0 16.292-5.698 31.272-15.19 43.078L40.797 30.191C52.603 20.698 67.583 15 83.875 15c37.978 0 68.875 30.897 68.875 68.875" />
          </svg>
        </button>
      </div>
      {moreColors === type && (
        <HexAlphaColorPicker color={color} onChange={onChange} style={{ width: "200px", height: "200px" }} />
      )}
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

  return (
    <div id="rte-widget-color-picker" className="px-1">
      <Commons
        themeColors={themeColors}
        onClose={onClose}
        type="TEXT"
        title="Text Color"
        onChange={onChangeTextColor}
        color={textColor}
        onRemove={onRemoveTextColor}
      />
      <div className="my-2 h-px bg-gray-400" />
      <Commons
        themeColors={themeColors}
        onClose={onClose}
        type="HIGHLIGHT"
        title="Highlight Color"
        onChange={onChangeHighlightColor}
        color={highlightColor}
        onRemove={onRemoveHighlightColor}
      />
    </div>
  );
};

const RteColorPicker = ({ editor, from }: { editor: any; from?: "settings" | "canvas" }) => {
  const currentTextColor = editor?.getAttributes("textStyle")?.color;
  const currentHighlightColor = editor?.getAttributes("highlight")?.color;

  const [textColor, setTextColor] = useState(currentTextColor);
  const [highlightColor, setHighlightColor] = useState(currentTextColor);
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
    setTextColor("#000000");
  };

  const handleRemoveHighlightColor = () => {
    editor?.chain().focus().unsetHighlight().run();
    setHighlightColor("#000000");
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
      trigger={
        <button
          type="button"
          className={cn("relative flex items-center", getActiveClasses(editor, Boolean(currentTextColor), from))}
          title="Text Color">
          <div
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: currentTextColor || (from === "canvas" ? "#FFFFFF" : "#000000") }}
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

import { debounce } from "lodash";

interface ColorPickerInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const hslToHex = (hslString: string): string => {
  // Parse the HSL values
  const [h, s, l] = hslString.split(" ").map((val) => parseFloat(val.replace("%", "")));

  // Convert HSL to RGB
  const s_decimal = s / 100;
  const l_decimal = l / 100;

  const c = (1 - Math.abs(2 * l_decimal - 1)) * s_decimal;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l_decimal - c / 2;
  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  // Convert RGB to hex
  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const hexToHsl = (hex: string): string => {
  // Convert hex to RGB first
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  // Find greatest and smallest channel values
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
};

const ColorPickerInput = ({ value, onChange, disabled }: ColorPickerInputProps) => {
  const handleColorChange = debounce((newValue: string) => {
    onChange(newValue);
  }, 200);

  return (
    <div className="relative flex size-5 cursor-pointer rounded-full border" style={{ backgroundColor: hslToHex(value) }}>
      <input
        type="color"
        value={hslToHex(value)}
        onChange={(e) => {
          const newHslValue = hexToHsl(e.target.value);
          handleColorChange(newHslValue);
        }}
        className="absolute inset-0 size-5 appearance-none rounded-full opacity-0"
        disabled={disabled}
      />
    </div>
  );
};

export default ColorPickerInput;

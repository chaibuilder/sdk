import { Input } from "../../../../../ui/shadcn/components/ui/input.tsx";
import { debounce } from "lodash-es";

const ColorPickerInput = ({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) => {
  const handleColorChange = debounce((value: string) => onChange(value), 200);

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
      <Input
        readOnly={disabled}
        type="text"
        value={value}
        onChange={(e) => handleColorChange(e.target.value)}
        className="flex-grow"
        disabled={disabled}
      />
    </div>
  );
};

export default ColorPickerInput;

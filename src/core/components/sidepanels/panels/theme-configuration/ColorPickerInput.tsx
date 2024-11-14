import { debounce } from "lodash-es";

const ColorPickerInput = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const handleColorChange = debounce((value: string) => onChange(value), 200);

  return (
    <div className="relative flex cursor-pointer rounded-full border" style={{ backgroundColor: value }}>
      <input
        type="color"
        value={value.startsWith("#") ? value : "#000000"}
        onChange={(e) => {
          const hexValue = e.target.value;
          if (/^#[0-9A-F]{6}$/i.test(hexValue)) {
            handleColorChange(hexValue);
          }
        }}
        className="size-5 border-none"
      />
    </div>
  );
};

export default ColorPickerInput;

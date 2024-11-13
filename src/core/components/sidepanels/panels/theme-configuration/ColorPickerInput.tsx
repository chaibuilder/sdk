import { Input } from "../../../../../ui/shadcn/components/ui/input.tsx";
import { debounce } from "lodash";

const ColorPickerInput = ({ value, onChange, disabled }: { value: string; onChange: (value: string) => void, disabled: boolean }) => {
  const handleColorChange = debounce((value: string) => onChange(value), 200);

  return (
    <div className="flex items-center space-x-2">
      <Input
        type="color"
        value={value}
        onChange={(e) => handleColorChange(e.target.value)}
        className="size-9 rounded p-0.5"
        disabled={disabled}
      />
      <Input 
      readOnly={disabled}
      type="text" value={value} onChange={(e) => handleColorChange(e.target.value)} className="flex-grow" disabled={disabled} />
    </div>
  );
};

export default ColorPickerInput;
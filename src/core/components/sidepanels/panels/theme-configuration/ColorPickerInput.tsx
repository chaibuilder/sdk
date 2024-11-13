import { Input } from "../../../../../ui/shadcn/components/ui/input.tsx";
import { debounce } from "lodash";

const ColorPickerInput = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const handleColorChange = debounce((value: string) => onChange(value), 200);

  return (
    <div className="flex items-center space-x-2">
      <Input
        type="color"
        value={value}
        onChange={(e) => handleColorChange(e.target.value)}
        className="size-9 rounded p-0.5"
      />
      <Input type="text" value={value} onChange={(e) => handleColorChange(e.target.value)} className="flex-grow" />
    </div>
  );
};

export default ColorPickerInput;
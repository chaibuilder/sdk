import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/shadcn/components/ui/select";
import { Label } from "@/ui/shadcn/components/ui/label";
import { useRegisteredFonts } from "@chaibuilder/runtime";
import { startCase } from "lodash-es";
import { useEffect } from "react";

const FontSelector = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => {
  const availableFonts = useRegisteredFonts();

  useEffect(() => {
    if (!availableFonts.some((font) => font.family === value)) {
      onChange(availableFonts[0].family);
    }
  }, [value, onChange]);

  return (
    <div className="space-y-0.5">
      <Label className="mb-1 block text-xs text-gray-600">{startCase(label)}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8 w-full text-xs text-black">
          <SelectValue placeholder="Select font" />
        </SelectTrigger>
        <SelectContent>
          {availableFonts.map((font) => (
            <SelectItem key={font.family} value={font.family}>
              {font.family}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FontSelector;

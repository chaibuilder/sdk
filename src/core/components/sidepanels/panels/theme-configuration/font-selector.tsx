import { Label } from "@/ui/shadcn/components/ui/label";
import { useRegisteredFonts } from "@chaibuilder/runtime";
import { startCase } from "lodash-es";

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
  return (
    <div className="space-y-0.5">
      <Label className="text-sm">{startCase(label)}</Label>
      <select
        className="mt-1 w-full cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border focus:ring-offset-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}>
        {availableFonts.map((font) => (
          <option key={font.family} value={font.family}>
            {font.family}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FontSelector;

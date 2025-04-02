import { useRegisteredFonts } from "@chaibuilder/runtime";
import { startCase } from "lodash-es";
import { Label } from "../../../../../ui";
import ChaiSelect from "../../../ChaiSelect";

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
      <Label className="text-sm text-slate-800">{startCase(label)}</Label>
      <ChaiSelect
        defaultValue={value}
        options={availableFonts.map((font) => ({
          value: font.family,
          label: font.family,
        }))}
        onValueChange={onChange}
      />
    </div>
  );
};

export default FontSelector;

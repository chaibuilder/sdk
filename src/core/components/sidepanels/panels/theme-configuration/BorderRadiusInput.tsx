import { debounce } from "lodash-es";
import { Slider } from "@/ui/shadcn/components/ui/slider";

type BorderRadiusInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

const BorderRadiusInput = ({ value, onChange, disabled }: BorderRadiusInputProps) => {
  const throttledChange = debounce((value: string) => onChange(value), 200);

  return (
    <Slider
      min={0}
      step={1}
      max={30}
      disabled={disabled}
      value={[Number(value.replace("px", ""))]} 
      onValueChange={(value) => throttledChange(value[0].toString())}
      className="flex-1 cursor-pointer"
    />
  );
};

export default BorderRadiusInput;

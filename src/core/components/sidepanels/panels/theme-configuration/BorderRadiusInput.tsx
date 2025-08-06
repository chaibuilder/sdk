import { Slider } from "@/ui/shadcn/components/ui/slider";
import { useThrottledCallback } from "@react-hookz/web";

type BorderRadiusInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

const BorderRadiusInput = ({ value, onChange, disabled }: BorderRadiusInputProps) => {
  const throttledChange = useThrottledCallback((value: string) => onChange(value), [value], 200, true);

  return (
    <Slider
      min={0}
      step={1}
      max={50}
      disabled={disabled}
      value={[Number(value.replace("px", ""))]} 
      onValueChange={(value) => throttledChange(value[0].toString())}
      className="flex-1 cursor-pointer"
    />
  );
};

export default BorderRadiusInput;

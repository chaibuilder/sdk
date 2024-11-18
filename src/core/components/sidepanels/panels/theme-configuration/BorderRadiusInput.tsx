import { debounce } from "lodash-es";

type BorderRadiusInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

const BorderRadiusInput = ({ value, onChange, disabled }: BorderRadiusInputProps) => {
  const throttledChange = debounce((value: string) => onChange(value), 200);

  return (
    <input
      type="range"
      min="0"
      step="1"
      max="30"
      disabled={disabled}
      defaultValue={value.replace("px", "")}
      onChange={(e) => throttledChange(e.target.value)}
      className="flex-1 cursor-pointer"
    />
  );
};

export default BorderRadiusInput;

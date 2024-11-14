import { debounce } from "lodash-es";

const BorderRadiusInput = ({ onChange, disabled }: { onChange: (value: string) => void; disabled: boolean }) => {
  const throttledChange = debounce((value: string) => onChange(value), 200);
  return (
    <input
      type="range"
      min="0"
      step="0.5"
      max="3"
      disabled={disabled}
      defaultValue="1.5"
      onChange={(e) => throttledChange(e.target.value)}
      className="flex-1"
    />
  );
};

export default BorderRadiusInput;

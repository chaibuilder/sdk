import { debounce } from "lodash";

const BorderRadiusInput = ({ onChange }: { onChange: (value: string) => void }) => {
    const throttledChange = debounce((value: string) => onChange(value), 200);
    return (
      <input
        type="range"
        min="0"
        step="0.5"
        max="8"
        defaultValue="0.5"
        onChange={(e) => throttledChange(e.target.value)}
        className="flex-1"
      />
    );
  };

export default BorderRadiusInput;
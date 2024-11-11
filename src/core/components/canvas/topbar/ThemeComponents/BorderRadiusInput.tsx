import { debounce } from "lodash";

const BorderRadiusInput = ({ onChange }: { onChange: (value: string) => void }) => {
    const throttledChange = debounce((value: string) => onChange(value), 200);
    return (
      <input
        type="range"
        min="0"
        max="16"
        defaultValue="8"
        onChange={(e) => throttledChange(e.target.value)}
        className="flex-1"
      />
    );
  };

export default BorderRadiusInput;

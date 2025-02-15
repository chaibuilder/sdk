import React, { ChangeEvent, useState } from "react";
import { mergeClasses } from "../..";

interface Option {
  value: string;
  label: string;
}

interface ChaiSelectProps {
  defaultValue?: string;
  onValueChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

const ChaiSelect: React.FC<ChaiSelectProps> = ({
  defaultValue = "",
  onValueChange,
  options,
  placeholder = "Select",
  className = "",
}) => {
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedValue(value);
    onValueChange(value);
  };

  return (
    <div className={mergeClasses("relative inline-block w-full", className)}>
      <select
        className="border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring mt-1 flex w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50"
        value={selectedValue}
        onChange={handleChange}>
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ChaiSelect;

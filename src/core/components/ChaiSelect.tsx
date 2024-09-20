import React, { ChangeEvent, useState } from "react";
import { mergeClasses } from "../main";

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
        className="focus:shadow-outline w-full appearance-none rounded border border-gray-300 bg-white px-4 py-1 pr-8 text-sm leading-tight shadow hover:border-gray-400 focus:outline-none"
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

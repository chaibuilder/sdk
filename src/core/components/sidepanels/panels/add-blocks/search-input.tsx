import { Input } from "@/ui/shadcn/components/ui/input";
import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput = ({ value, onChange, placeholder, className = "" }: SearchInputProps) => {
  const { t } = useTranslation();

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className={`relative w-full ${className}`}>
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder || t("Search blocks...")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-8 pr-8"
      />
      {value && (
        <button onClick={handleClear} className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

import { CheckIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";
import { Button, Card, CardContent } from "../../../ui";

interface LayoutCardProps {
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

function LayoutCard({ disabled = false, description, title, selected, onSelect, children }: LayoutCardProps) {
  const { t } = useTranslation();
  return (
    <Card
      aria-disabled={disabled}
      className={`cursor-pointer border-border transition-all ${selected ? "ring-2 ring-secondary" : ""} ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      onClick={onSelect}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          {selected && <CheckIcon className="h-6 w-6 rounded-full bg-background p-px text-foreground" />}
        </div>
        <p className="mb-4 text-sm text-muted-foreground">{description}</p>
        {children}
        <Button disabled={disabled} className="mt-4 w-full" variant={selected ? "default" : "outline"}>
          {disabled ? t("Coming soon") : selected ? t("Selected") : t("Select")}
        </Button>
      </CardContent>
    </Card>
  );
}

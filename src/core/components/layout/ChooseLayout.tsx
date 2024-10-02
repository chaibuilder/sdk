import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Card,
  CardContent,
} from "../../../ui";
import { useTranslation } from "react-i18next";
import { CheckIcon, Cross2Icon } from "@radix-ui/react-icons";
import { LayoutVariant } from "../../constants/LAYOUT_MODE.ts";
import { useLayoutVariant } from "../../hooks";

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

export const ChooseLayout = ({ open, close }: { open: boolean; close: () => void }) => {
  const { t } = useTranslation();
  const [layoutVariant, setLayoutVariant] = useLayoutVariant();
  const handleLayoutSelect = (layout: LayoutVariant) => {
    setLayoutVariant(layout);
    close();
  };
  return (
    <AlertDialog open={open} onOpenChange={() => (open ? close() : "")}>
      <AlertDialogContent className="max-w-4xl overflow-hidden border-border">
        <AlertDialogHeader className="flex flex-row items-center justify-between">
          <AlertDialogTitle className="text-foreground">{t("Choose Builder Layout")}</AlertDialogTitle>
          <button
            onClick={() => close()}
            className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300">
            <Cross2Icon className="h-6 w-6" />
          </button>
        </AlertDialogHeader>
        <div className="no-scrollbar max-h-full overflow-hidden">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <LayoutCard
              title={t("Single side panel")}
              description={t("Suitable for smaller screens. Bigger canvas size.")}
              selected={layoutVariant === "SINGLE_SIDE_PANEL"}
              onSelect={() => handleLayoutSelect("SINGLE_SIDE_PANEL")}>
              <div className="flex flex-col rounded border border-border">
                <div className="borde-b h-4 border-b border-border"></div>
                <div className="flex h-32">
                  <div className="w-1/4 bg-secondary"></div>
                  <div className="w-3/4 border-l border-border bg-background"></div>
                </div>
              </div>
            </LayoutCard>
            <LayoutCard
              title={t("Dual side panel")}
              description={t("Suitable for larger screens. Blocks settings is always visible.")}
              selected={layoutVariant === "DUAL_SIDE_PANEL"}
              onSelect={() => handleLayoutSelect("DUAL_SIDE_PANEL")}>
              <div className="flex flex-col rounded border border-border">
                <div className="borde-b h-4 border-b border-border"></div>
                <div className="flex h-32">
                  <div className="w-1/4 bg-secondary"></div>
                  <div className="w-2/4 border-x border-border bg-background"></div>
                  <div className="w-1/4 bg-secondary"></div>
                </div>
              </div>
            </LayoutCard>
            <LayoutCard
              disabled
              title={t("Dual side panel advanced")}
              description={t("Suitable for heavy styling & block editing. Setting are always visible.")}
              selected={false}
              onSelect={() => void 0}>
              <div className="flex flex-col rounded border border-border">
                <div className="borde-b h-4 border-b border-border"></div>
                <div className="flex h-32">
                  <div className="w-1/4 bg-secondary"></div>
                  <div className="w-2/4 border-x border-border bg-background"></div>
                  <div className="w-1/4 bg-secondary"></div>
                </div>
              </div>
            </LayoutCard>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

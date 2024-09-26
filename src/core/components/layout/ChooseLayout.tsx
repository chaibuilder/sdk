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
import { LAYOUT_VARIANTS, LayoutVariant } from "../../constants/LAYOUT_VARIANTS.ts";
import { useLayoutVariant } from "../../hooks";

interface LayoutCardProps {
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}

function LayoutCard({ description, title, selected, onSelect, children }: LayoutCardProps) {
  const { t } = useTranslation();
  return (
    <Card className={`cursor-pointer transition-all ${selected ? "ring-2 ring-secondary" : ""}`} onClick={onSelect}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          {selected && <CheckIcon className="text-primary" />}
        </div>
        <p className="mb-4 text-sm text-muted-foreground">{description}</p>
        {children}
        <Button className="mt-4 w-full" variant={selected ? "default" : "outline"}>
          {selected ? t("Selected") : t("Select")}
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
      <AlertDialogContent className="max-w-2xl overflow-hidden">
        <AlertDialogHeader className="flex flex-row items-center justify-between">
          <AlertDialogTitle>{t("Choose Builder Layout")}</AlertDialogTitle>
          <button
            onClick={() => close()}
            className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300">
            <Cross2Icon className="h-6 w-6" />
          </button>
        </AlertDialogHeader>
        <div className="no-scrollbar max-h-full overflow-hidden">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <LayoutCard
              title={t("Single side panel")}
              description={t("Suitable for smaller screens. Bigger canvas size.")}
              selected={layoutVariant === LAYOUT_VARIANTS.SINGLE_SIDE_PANEL}
              onSelect={() => handleLayoutSelect(LAYOUT_VARIANTS.SINGLE_SIDE_PANEL)}>
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
              selected={layoutVariant === LAYOUT_VARIANTS.DUAL_SIDE_PANEL}
              onSelect={() => handleLayoutSelect(LAYOUT_VARIANTS.DUAL_SIDE_PANEL)}>
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

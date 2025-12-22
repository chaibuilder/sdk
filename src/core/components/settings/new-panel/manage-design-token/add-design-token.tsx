import { orderClassesByBreakpoint } from "@/core/functions/order-classes-by-breakpoint";
import { removeDuplicateClasses } from "@/core/functions/remove-duplicate-classes";
import { Button } from "@/ui/shadcn/components/ui/button";
import { Input } from "@/ui/shadcn/components/ui/input";
import { Label } from "@/ui/shadcn/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/ui/shadcn/components/ui/sheet";
import { useTranslation } from "react-i18next";
import { twMerge } from "tailwind-merge";
import { ManualClasses } from "../manual-classes";

export interface AddDesignTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenName: string;
  onTokenNameChange: (value: string) => void;
  tokenNameError: string;
  classes: string;
  onClassesChange: (value: string) => void;
  onAdd: () => void;
}

export const AddDesignTokenModal = ({
  isOpen,
  onClose,
  tokenName,
  onTokenNameChange,
  tokenNameError,
  classes,
  onClassesChange,
  onAdd,
}: AddDesignTokenModalProps) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[450px]">
        <SheetHeader>
          <SheetTitle className="text-base">{t("Add Design Token")}</SheetTitle>
          <SheetDescription className="text-sm">
            {t("Create a new reusable design token with Tailwind classes.")}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-selector" className="text-sm">
              {t("Token Name")}
            </Label>
            <Input
              id="new-selector"
              placeholder="Button-Primary"
              value={tokenName}
              onChange={(e) => onTokenNameChange(e.target.value)}
              className="h-7 text-xs"
            />
            {tokenNameError ? (
              <span className="text-xs text-destructive">{tokenNameError}</span>
            ) : (
              <span className="text-xs font-light text-muted-foreground">
                {t("Button-Primary, Card-Header, Text-Large etc.")}
              </span>
            )}
          </div>
          <ManualClasses
            from="designToken"
            classFromProps={classes}
            onAddNew={(cls: string) => {
              const newCls = orderClassesByBreakpoint(removeDuplicateClasses(twMerge(classes, cls)));
              onClassesChange(newCls);
            }}
          />
        </div>
        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={onClose} className="h-8 text-sm">
            {t("Cancel")}
          </Button>
          <Button onClick={onAdd} className="h-8 text-sm">
            {t("Add Token")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

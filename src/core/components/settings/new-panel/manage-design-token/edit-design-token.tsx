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

export interface EditDesignTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenName: string;
  onTokenNameChange: (value: string) => void;
  tokenNameError: string;
  classes: string;
  onClassesChange: (value: string) => void;
  onEdit: () => void;
}

export const EditDesignTokenModal = ({
  isOpen,
  onClose,
  tokenName,
  onTokenNameChange,
  tokenNameError,
  classes,
  onClassesChange,
  onEdit,
}: EditDesignTokenModalProps) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[450px]">
        <SheetHeader>
          <SheetTitle className="text-base">{t("Edit Design Token")}</SheetTitle>
          <SheetDescription className="text-sm">{t("Update the design token name and classes.")}</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-selector" className="text-sm">
              {t("Token Name")}
            </Label>
            <Input
              id="edit-selector"
              value={tokenName}
              onChange={(e) => onTokenNameChange(e.target.value)}
              className="h-7 text-xs"
            />
            {tokenNameError && <span className="text-sm text-destructive">{tokenNameError}</span>}
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
          <Button onClick={onEdit} className="h-8 text-sm">
            {t("Update Token")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

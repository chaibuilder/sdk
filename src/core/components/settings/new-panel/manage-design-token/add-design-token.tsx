import { Button } from "@/ui/shadcn/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/shadcn/components/ui/dialog";
import { Input } from "@/ui/shadcn/components/ui/input";
import { Label } from "@/ui/shadcn/components/ui/label";
import { Textarea } from "@/ui/shadcn/components/ui/textarea";
import { useTranslation } from "react-i18next";

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">{t("Add Design Token")}</DialogTitle>
          <DialogDescription className="text-sm">
            {t("Create a new reusable design token with Tailwind classes.")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-selector" className="text-sm">
              {t("Token Name")}
            </Label>
            <Input
              id="new-selector"
              placeholder="Button-Primary"
              value={tokenName}
              onChange={(e) => onTokenNameChange(e.target.value)}
              className="text-sm"
            />
            {tokenNameError ? (
              <span className="text-sm text-destructive">{tokenNameError}</span>
            ) : (
              <span className="text-sm text-muted-foreground">{t("Button-Primary, Card-Header, Text-Large")}</span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-classes" className="text-sm">
              {t("Tailwind Classes")}
            </Label>
            <Textarea
              id="new-classes"
              placeholder="bg-blue-500 text-white px-4 py-2"
              value={classes}
              onChange={(e) => onClassesChange(e.target.value)}
              className="min-h-[80px] resize-none font-mono text-xs"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="h-8 text-sm">
            {t("Cancel")}
          </Button>
          <Button onClick={onAdd} className="h-8 text-sm">
            {t("Add Token")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">{t("Edit Design Token")}</DialogTitle>
          <DialogDescription className="text-sm">{t("Update the design token name and classes.")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-selector" className="text-sm">
              {t("Token Name")}
            </Label>
            <Input
              id="edit-selector"
              value={tokenName}
              onChange={(e) => onTokenNameChange(e.target.value)}
              className="text-sm"
            />
            {tokenNameError && <span className="text-sm text-destructive">{tokenNameError}</span>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-classes" className="text-sm">
              {t("Classes")}
            </Label>
            <Textarea
              id="edit-classes"
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
          <Button onClick={onEdit} className="h-8 text-sm">
            {t("Update Token")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

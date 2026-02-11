import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TokensIcon } from "@radix-ui/react-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ManageDesignTokens from "./manage-design-tokens";
import { DesignTokenPreview } from "./design-token-preview";

interface ManageDesignTokensModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ManageDesignTokensModal: React.FC<ManageDesignTokensModalProps> = ({ open, onOpenChange }) => {
  const { t } = useTranslation();
  const [activeToken, setActiveToken] = useState<{ name: string; value: string; id?: string } | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-6xl flex-col gap-0 p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            <TokensIcon className="h-5 w-5 text-primary" />
            {t("Design Token Management")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Left side - Token Management */}
          <div className="flex w-1/2 flex-col border-r border-border p-4">
            <ManageDesignTokens onActiveTokenChange={setActiveToken} />
          </div>

          {/* Right side - Live Preview */}
          <div className="flex w-1/2 flex-col p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">{t("Live Preview")}</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              <DesignTokenPreview activeToken={activeToken} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

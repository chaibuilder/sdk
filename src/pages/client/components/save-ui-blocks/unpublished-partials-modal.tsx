import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PartialBlockInfo } from "@/pages/hooks/pages/use-get-unpublished-partial-blocks";
import { Eye } from "lucide-react";
import { useTranslation } from "react-i18next";

interface UnpublishedPartialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  onViewChanges?: (partialId: string, partialName: string) => void;
  isPending?: boolean;
  partialBlocksInfo?: PartialBlockInfo[];
}

const UnpublishedPartialsModal = ({
  isOpen,
  onClose,
  onContinue,
  onViewChanges,
  isPending = false,
  partialBlocksInfo = [],
}: UnpublishedPartialsModalProps) => {
  const { t } = useTranslation();
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {isOpen && (
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("Publish Page with Unpublished Blocks?")}</DialogTitle>
            <DialogDescription>
              {t(
                "You have unpublished changes in the following blocks. They will be published together with the page.",
              )}
            </DialogDescription>
          </DialogHeader>
          {partialBlocksInfo?.length > 0 && (
            <div className="max-h-32 overflow-y-auto rounded-md border bg-muted/50 p-2">
              <ul className="space-y-1 text-sm">
                {partialBlocksInfo.map((info) => (
                  <li key={info?.id} className="flex items-center justify-between text-muted-foreground">
                    <span>• {info?.name}</span>
                    <span className="flex items-center gap-1">
                      {info?.status === "unpublished_changes" && onViewChanges && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title={t("View Changes")}
                          className="h-4 w-4 text-blue-600 hover:bg-blue-100 hover:text-blue-800 dark:hover:bg-blue-900"
                          onClick={() => onViewChanges(info.id, info.name)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                      )}
                      <span
                        className={`rounded text-[10px] ${
                          info?.status === "unpublished" && "text-orange-700"
                        }`}>
                        {info?.status === "unpublished" && t("Unpublished page")}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isPending}>
              {t("Cancel")}
            </Button>
            <Button onClick={onContinue} disabled={isPending}>
              {isPending ? t("Publishing...") : t("Publish Page & Blocks")}
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default UnpublishedPartialsModal;

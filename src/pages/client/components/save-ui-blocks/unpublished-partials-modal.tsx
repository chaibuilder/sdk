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

interface UnpublishedPartialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  isPending?: boolean;
  partialBlocksInfo?: PartialBlockInfo[];
}

const UnpublishedPartialsModal = ({
  isOpen,
  onClose,
  onContinue,
  isPending = false,
  partialBlocksInfo = [],
}: UnpublishedPartialsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {isOpen && (
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Unpublished Partial Blocks</DialogTitle>
            <DialogDescription>
              These partial blocks will be published along with the page. Do you want to continue?
            </DialogDescription>
          </DialogHeader>
          {partialBlocksInfo?.length > 0 && (
            <div className="max-h-32 overflow-y-auto rounded-md border bg-muted/50 p-2">
              <ul className="space-y-1 text-sm">
                {partialBlocksInfo.map((info) => (
                  <li key={info?.id} className="flex items-center justify-between text-muted-foreground">
                    <span>• {info?.name}</span>
                    <span
                      className={`ml-2 rounded px-1.5 pb-0.5 text-[10px] ${
                        info?.status === "unpublished" ? "text-orange-700" : "text-blue-700"
                      }`}>
                      {info?.status === "unpublished" ? "Unpublished page" : "Unpublished changes"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={onContinue} disabled={isPending}>
              {isPending ? "Publishing..." : "Publish page & Partial blocks"}
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default UnpublishedPartialsModal;

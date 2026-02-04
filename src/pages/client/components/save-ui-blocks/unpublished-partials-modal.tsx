import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UnpublishedPartialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  isPending?: boolean;
  partialBlockNames?: string[];
}

const UnpublishedPartialsModal = ({
  isOpen,
  onClose,
  onContinue,
  isPending = false,
  partialBlockNames = [],
}: UnpublishedPartialsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {isOpen && (
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Unpublished Partial Blocks</DialogTitle>
            <DialogDescription>
              The page contains unpublished partial blocks. Do you want to continue publishing anyway
              or cancel to publish the blocks first?
            </DialogDescription>
          </DialogHeader>
          {partialBlockNames?.length > 0 && (
            <div className="max-h-32 overflow-y-auto rounded-md border bg-muted/50 p-2">
              <ul className="space-y-1 text-sm">
                {partialBlockNames.map((name, index) => (
                  <li key={index} className="text-muted-foreground">
                    • {name}
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
              {isPending ? "Publishing..." : "Publish with Partial Blocks"}
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default UnpublishedPartialsModal;

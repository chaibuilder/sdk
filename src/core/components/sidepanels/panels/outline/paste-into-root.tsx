import { DropdownMenuItem } from "@/ui/shadcn/components/ui/dropdown-menu";

import { usePasteBlocks } from "@/core/hooks/use-paste-blocks";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/ui/shadcn/components/ui/dropdown-menu";
import { CardStackIcon } from "@radix-ui/react-icons";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export const PasteAtRootContextMenu = ({ parentContext, setParentContext }) => {
  const { t } = useTranslation();
  const { canPaste, pasteBlocks } = usePasteBlocks();

  useEffect(() => {
    if (!canPaste("root")) setParentContext(null);
  }, [canPaste("root")]);

  if (!parentContext || !canPaste("root")) return null;

  return (
    <div className="absolute inset-0">
      <DropdownMenu open={true} onOpenChange={() => setParentContext(null)}>
        <DropdownMenuTrigger className="hidden" />
        <DropdownMenuContent
          className="absolute w-28 p-1 text-xs"
          style={{ top: parentContext.y, left: parentContext.x }}>
          <DropdownMenuItem
            className="flex items-center gap-x-4 text-xs"
            onClick={() => {
              pasteBlocks("root");
              setParentContext(null);
            }}>
            <CardStackIcon /> {t("Paste")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

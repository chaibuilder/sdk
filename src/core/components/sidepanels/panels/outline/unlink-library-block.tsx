import { useSelectedBlock, useUpdateBlocksProps } from "@/core/hooks";
import { DropdownMenuItem } from "@/ui/shadcn/components/ui/dropdown-menu";
import { LinkBreak2Icon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";

export const UnlinkLibraryBlock = () => {
  const { t } = useTranslation();
  const selectedBlock = useSelectedBlock();
  const updateBlocksProps = useUpdateBlocksProps();

  const handleUnlink = () => {
    updateBlocksProps([selectedBlock._id], {
      _libBlockId: null,
    });
  };

  return (
    <DropdownMenuItem onClick={handleUnlink} className="flex items-center gap-x-4 text-xs">
      <LinkBreak2Icon className="h-4 w-4" /> {t("Unlink from library")}
    </DropdownMenuItem>
  );
};

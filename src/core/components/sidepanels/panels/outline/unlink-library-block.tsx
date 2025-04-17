import { UnlinkIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DropdownMenuItem } from "../../../../../ui";
import { useSelectedBlock, useUpdateBlocksProps } from "../../../../hooks";
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
      <UnlinkIcon className="h-4 w-4" /> {t("Unlink from library")}
    </DropdownMenuItem>
  );
};

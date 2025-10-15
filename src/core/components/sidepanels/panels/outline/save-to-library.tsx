import { saveToLibraryModalAtom } from "@/core/components/sidepanels/panels/outline/upsert-library-block-modal";
import { useSaveToLibraryComponent } from "@/core/extensions/save-to-library";
import { useSelectedBlock } from "@/core/hooks";
import { DropdownMenuItem } from "@/ui/shadcn/components/ui/dropdown-menu";
import { CheckIcon } from "@radix-ui/react-icons";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";

export const SaveToLibrary = () => {
  const selectedBlock = useSelectedBlock();
  const { t } = useTranslation();
  const [, setModalState] = useAtom(saveToLibraryModalAtom);
  const SaveToLibraryComponent = useSaveToLibraryComponent();

  const handleSaveToLibrary = () => {
    if (selectedBlock) {
      setModalState({
        isOpen: true,
        blockId: selectedBlock._id,
      });
    }
  };

  if (!SaveToLibraryComponent) return null;

  return (
    <DropdownMenuItem className="flex items-center gap-x-4 text-xs" onClick={handleSaveToLibrary}>
      <CheckIcon className="h-4 w-4" /> {selectedBlock?._libBlockId ? t("Update library block") : t("Save to library")}
    </DropdownMenuItem>
  );
};

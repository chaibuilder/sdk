import { saveToLibraryModalAtom } from "@/core/components/sidepanels/panels/outline/upsert-library-block-modal";
import { useSaveToLibraryComponent } from "@/core/extensions/save-to-library";
import { useSelectedBlock } from "@/core/hooks";
import { DropdownMenuItem } from "@/ui/shadcn/components/ui/dropdown-menu";
import { useAtom } from "jotai";
import { SaveIcon } from "lucide-react";
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
      <SaveIcon className="h-4 w-4" /> {t(selectedBlock?._libBlockId ? "Update library block" : "Save to library")}
    </DropdownMenuItem>
  );
};

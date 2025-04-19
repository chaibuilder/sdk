import { useSaveToLibraryComponent } from "@/core/extensions/save-to-library";
import { ChaiBlock, useBlocksStore } from "@/core/main";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/shadcn/components/ui/dialog";
import { atom, useAtom } from "jotai";
import { filter, find, isEmpty } from "lodash-es";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
export const saveToLibraryModalAtom = atom<{
  isOpen: boolean;
  blockId: string | null;
}>({
  isOpen: false,
  blockId: null,
});

const getBlocks = (allBlocks: ChaiBlock[], parent: string) => {
  const blocks = filter(allBlocks, { _parent: parent });
  if (blocks.length === 0) return [];

  const blockTree: ChaiBlock[] = [...blocks];
  blocks.forEach((block) => {
    blockTree.push(...getBlocks(allBlocks, block?._id));
  });
  return blockTree;
};

// Save to Library Modal Component
export const SaveToLibraryModal = () => {
  const [modalState, setModalState] = useAtom(saveToLibraryModalAtom);
  const { t } = useTranslation();
  const [blocks] = useBlocksStore();
  const close = () => setModalState({ isOpen: false, blockId: null });
  const SaveToLibraryComponent = useSaveToLibraryComponent();

  const nestedBlocks = useMemo(() => {
    if (!modalState.blockId) return [];
    const topBlock = find(blocks, { _id: modalState.blockId });
    delete topBlock?._parent;
    return [topBlock, ...getBlocks(blocks, topBlock?._id)];
  }, [modalState.blockId, blocks]);

  return (
    <Dialog open={modalState.isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="p-4 sm:max-w-[450px]">
        <DialogHeader className="pb-2">
          <DialogTitle>{t("Save to Library")}</DialogTitle>
        </DialogHeader>
        {SaveToLibraryComponent && !isEmpty(modalState.blockId) && (
          <SaveToLibraryComponent blockId={modalState.blockId} blocks={nestedBlocks} close={close} />
        )}
      </DialogContent>
    </Dialog>
  );
};

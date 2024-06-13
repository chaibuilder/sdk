import { useEffect } from "react";
import { useFrame } from "../../frame";
import { useAtom } from "jotai";
import { first } from "lodash-es";
import {
  useDuplicateBlocks,
  usePreviewMode,
  useRemoveBlocks,
  useSavePage,
  useSelectedBlockIds,
  useSelectedStylingBlocks,
  useUndoManager,
} from "../../hooks";
import { editLayerNameAtom, inlineEditingActiveAtom } from "../../atoms/ui";
import { useBlocksStore } from "../../history/useBlocksStoreUndoableActions.ts";

export const KeyboardHandler = () => {
  const { window: iframeWin }: any = useFrame();
  const [ids, setSelected] = useSelectedBlockIds();
  const [allBlocks] = useBlocksStore();
  const [, setStylingBlocks] = useSelectedStylingBlocks();
  const { undo, redo } = useUndoManager();
  const duplicateBlocks = useDuplicateBlocks();
  const [, setPreview] = usePreviewMode();
  const removeBlocks = useRemoveBlocks();
  const { savePage } = useSavePage();
  const [editingBlockId] = useAtom(inlineEditingActiveAtom);
  const [, setEditName] = useAtom(editLayerNameAtom);
  const enterEditMode = (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (ids.length === 1) {
        setEditName(first(ids));
      }
    }
  };

  const getParentBlockId = (id: string) => {
    const block = allBlocks.find((b) => b._id === id);
    if (!block) return null;
    return block._parent;
  };

  useEffect(() => {
    // eslint-disable-next-line consistent-return
    const handleKeyDown = (e: any) => {
      if (e.key === "Escape") {
        setSelected([]);
        setStylingBlocks([]);
        return;
      }
      enterEditMode(e);
      if (!editingBlockId && (e.key === "Delete" || e.key === "Backspace")) {
        e.preventDefault();
        removeBlocks(ids);
      }
      if (e.ctrlKey || e.metaKey) {
        // if up arrow key is pressed
        if (e.key === "ArrowUp") {
          e.preventDefault();
          const parentBlockId = ids.length > 0 ? getParentBlockId(ids[0]) : null;
          if (parentBlockId) {
            setSelected([parentBlockId]);
          }
        }
        if (["z", "y", "d", "x", "c", "p", "s", "v"].includes(e.key)) {
          if (editingBlockId && ["x", "z", "v"].includes(e.key)) {
            return true;
          }
          e.preventDefault();
        }
        if (e.key === "s") {
          e.stopPropagation();
          e.preventDefault();
          savePage();
        }
        if (e.key === "z") undo();
        if (e.key === "y") redo();
        if (e.key === "d") duplicateBlocks(ids);
      }
    };
    // FIXME: check for performance impact
    iframeWin.removeEventListener("keydown", handleKeyDown);
    iframeWin.addEventListener("keydown", handleKeyDown);
    return () => {
      iframeWin.removeEventListener("keydown", handleKeyDown);
    };
  }, [ids, setSelected, undo, removeBlocks, setPreview, redo, duplicateBlocks, editingBlockId, savePage, iframeWin]);
  return null;
};

import { useEffect } from "react";
import { useFrame } from "../../frame";
import { useAtom } from "jotai";
import { first } from "lodash";
import {
  useCanvasHistory,
  useCopyBlockIds,
  useCutBlockIds,
  useDuplicateBlocks,
  usePasteBlocks,
  usePreviewMode,
  useRemoveBlocks,
  useSavePage,
  useSelectedBlockIds,
  useSelectedStylingBlocks,
} from "../../hooks";
import { editLayerNameAtom, inlineEditingActiveAtom } from "../../atoms/ui";

export const KeyboardHandler = () => {
  const { window: iframeWin }: any = useFrame();
  const [ids, setSelected] = useSelectedBlockIds();
  const [, setStylingBlocks] = useSelectedStylingBlocks();
  const { undo, redo } = useCanvasHistory();
  const duplicateBlocks = useDuplicateBlocks();
  const [, cut] = useCutBlockIds();
  const [, copy] = useCopyBlockIds();
  const { pasteBlocks } = usePasteBlocks();
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
        if (e.key === "x") cut(ids);
        if (e.key === "c") copy(ids);
        if (e.key === "v" && ids.length > 0) pasteBlocks(ids[0]);
      }
    };
    // FIXME: check for performance impact
    iframeWin.removeEventListener("keydown", handleKeyDown);
    iframeWin.addEventListener("keydown", handleKeyDown);
    return () => {
      iframeWin.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    ids,
    setSelected,
    undo,
    removeBlocks,
    setPreview,
    redo,
    duplicateBlocks,
    cut,
    copy,
    pasteBlocks,
    editingBlockId,
    savePage,
    iframeWin,
  ]);
  return null;
};

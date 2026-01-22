import { canDeleteBlock } from "@/core/functions/block-helpers";
import { undoManager, useUndoManager } from "@/core/history/use-undo-manager";
import { useCopyBlocks as useCopyBlockIds } from "@/hooks/use-copy-blockIds";
import { useCutBlockIds } from "@/hooks/use-cut-blockIds";
import { useDuplicateBlocks } from "@/hooks/use-duplicate-blocks";
import { usePasteBlocks } from "@/hooks/use-paste-blocks";
import { useRemoveBlocks } from "@/hooks/use-remove-blocks";
import { useSelectedBlock, useSelectedBlockIds } from "@/hooks/use-selected-blockIds";
import { get, isEmpty } from "lodash-es";
import { useHotkeys } from "react-hotkeys-hook";

export const useKeyEventWatcher = (doc?: Document) => {
  const [ids, setIds] = useSelectedBlockIds();
  const selectedBlock = useSelectedBlock();
  const removeBlocks = useRemoveBlocks();
  const duplicateBlocks = useDuplicateBlocks();
  const { undo, redo } = useUndoManager();
  const [, setCutBlockIds] = useCutBlockIds();
  const [, setCopyBlockIds] = useCopyBlockIds();
  const { canPaste, pasteBlocks } = usePasteBlocks();
  const options = doc ? { document: doc } : {};

  useHotkeys(
    "ctrl+z,meta+z",
    (e) => {
      e.preventDefault();
      if (undoManager.hasUndo()) {
        undo();
      }
    },
    { ...options, preventDefault: true },
    [undo],
  );
  useHotkeys(
    "ctrl+y,meta+y",
    (e) => {
      e.preventDefault();
      if (undoManager.hasRedo()) {
        redo();
      }
    },
    { ...options, preventDefault: true },
    [redo],
  );
  useHotkeys(
    "ctrl+x,meta+x",
    (e) => {
      e.preventDefault();
      if (!isEmpty(ids)) {
        setCutBlockIds(ids);
      }
    },
    { ...options, enabled: !isEmpty(ids), preventDefault: true },
    [ids, setCutBlockIds],
  );
  useHotkeys(
    "ctrl+c,meta+c",
    () => setCopyBlockIds(ids),
    { ...options, enabled: !isEmpty(ids), preventDefault: true },
    [ids, setCopyBlockIds],
  );
  useHotkeys(
    "ctrl+v,meta+v",
    async () => {
      if (await canPaste(ids[0])) {
        pasteBlocks(ids);
      }
    },
    { ...options, enabled: !isEmpty(ids), preventDefault: true },
    [ids, canPaste, pasteBlocks],
  );

  useHotkeys("esc", () => setIds([]), options, [setIds]);
  useHotkeys(
    "ctrl+d,meta+d",
    () => duplicateBlocks(ids),
    { ...options, enabled: !isEmpty(ids), preventDefault: true },
    [ids, duplicateBlocks],
  );
  useHotkeys(
    "del, backspace",
    (event: any) => {
      event.preventDefault();

      if (canDeleteBlock(get(selectedBlock, "_type", ""))) {
        removeBlocks(ids);
      }
    },
    options,
    [ids, removeBlocks],
  );
};

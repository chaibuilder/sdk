import { canDeleteBlock } from "@/core/functions/block-helpers";
import { useCopyBlockIds, useCutBlockIds, useUndoManager } from "@/core/hooks";
import { useDuplicateBlocks } from "@/core/hooks/use-duplicate-blocks";
import { usePasteBlocks } from "@/core/hooks/use-paste-blocks";
import { useRemoveBlocks } from "@/core/hooks/use-remove-blocks";
import { useSelectedBlock, useSelectedBlockIds } from "@/core/hooks/use-selected-blockIds";
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

  useHotkeys("ctrl+z,command+z", () => undo(), {}, [undo]);
  useHotkeys("ctrl+y,command+y", () => redo(), {}, [redo]);
  useHotkeys("ctrl+x,command+x", () => setCutBlockIds(ids), {}, [ids, setCutBlockIds]);
  useHotkeys(
    "ctrl+c,command+c",
    () => setCopyBlockIds(ids),
    { ...options,  enabled: !isEmpty(ids), preventDefault: true },
    [ids, setCopyBlockIds],
  );
  useHotkeys(
    "ctrl+v,command+v",
    () => {
      if (canPaste(ids[0])) {
        pasteBlocks(ids);
      }
    },
    { ...options, enabled: !isEmpty(ids), preventDefault: true },
    [ids, canPaste, pasteBlocks],
  );

  useHotkeys("esc", () => setIds([]), options, [setIds]);
  useHotkeys("ctrl+d,command+d", () => duplicateBlocks(ids), { ...options, enabled: !isEmpty(ids), preventDefault: true }, [
    ids,
    duplicateBlocks,
  ]);
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

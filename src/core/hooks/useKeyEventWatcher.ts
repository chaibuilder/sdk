import { useHotkeys } from "react-hotkeys-hook";
import { useSelectedBlock, useSelectedBlockIds } from "./useSelectedBlockIds";
import { useRemoveBlocks } from "./useRemoveBlocks";
import { useDuplicateBlocks } from "./useDuplicateBlocks";
import { useUndoManager } from "../history/useUndoManager.ts";
import { useCutBlockIds } from "./useCutBlockIds.ts";
import { useCopyBlockIds } from "./useCopyBlockIds.ts";
import { usePasteBlocks } from "./usePasteBlocks.ts";
import { canDeleteBlock } from "../functions/block-helpers.ts";
import { get } from "lodash-es";

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
  useHotkeys("ctrl+c,command+c", () => setCopyBlockIds(ids), {}, [ids, setCopyBlockIds]);
  useHotkeys(
    "ctrl+v,command+v",
    () => {
      if (canPaste(ids[0])) {
        pasteBlocks(ids);
      }
    },
    { ...options, preventDefault: true },
    [ids, canPaste, pasteBlocks],
  );

  useHotkeys("esc", () => setIds([]), options, [setIds]);
  useHotkeys("ctrl+d,command+d", () => duplicateBlocks(ids), { ...options, preventDefault: true }, [
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

import { useHotkeys } from "react-hotkeys-hook";
import { useSelectedBlockIds } from "./useSelectedBlockIds";
import { useRemoveBlocks } from "./useRemoveBlocks";
import { useDuplicateBlocks } from "./useDuplicateBlocks";
import { useUndoManager } from "../history/useUndoManager.ts";

export const useKeyEventWatcher = (doc?: Document) => {
  const [ids, setIds] = useSelectedBlockIds();
  const removeBlocks = useRemoveBlocks();
  const duplicateBlocks = useDuplicateBlocks();
  const { undo, redo } = useUndoManager();

  const options = doc ? { document: doc } : {};
  useHotkeys("esc", () => setIds([]), options, [setIds]);
  useHotkeys("ctrl+d,command+d", () => duplicateBlocks(ids), { ...options, preventDefault: true }, [
    ids,
    duplicateBlocks,
  ]);
  useHotkeys("ctrl+z,command+z", () => undo(), options, [undo]);
  useHotkeys("ctrl+y,command+y", () => redo(), options, [redo]);
  useHotkeys(
    "del, backspace",
    (event: any) => {
      event.preventDefault();
      removeBlocks(ids);
    },
    options,
    [ids, removeBlocks],
  );
};

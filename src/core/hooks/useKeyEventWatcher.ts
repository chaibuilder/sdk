import { useHotkeys } from "react-hotkeys-hook";
import { useSelectedBlockIds } from "./useSelectedBlockIds";
import { useRemoveBlocks } from "./useRemoveBlocks";
import { useDuplicateBlocks } from "./useDuplicateBlocks";
import { useUndoManager } from "../history/useUndoManager.ts";

export const useKeyEventWatcher = () => {
  const [ids, setIds] = useSelectedBlockIds();
  const removeBlocks = useRemoveBlocks();
  const duplicateBlocks = useDuplicateBlocks();
  const { undo, redo } = useUndoManager();

  useHotkeys("esc", () => setIds([]), {}, [setIds]);
  useHotkeys("ctrl+d,command+d", () => duplicateBlocks(ids), { preventDefault: true }, [ids, duplicateBlocks]);
  useHotkeys("ctrl+z,command+z", () => undo(), {}, [undo]);
  useHotkeys("ctrl+y,command+y", () => redo(), {}, [redo]);

  useHotkeys(
    "del, backspace",
    (event: any) => {
      event.preventDefault();
      removeBlocks(ids);
    },
    {},
    [ids, removeBlocks],
  );
};

import { useHotkeys } from "react-hotkeys-hook";
import { useSelectedBlockIds } from "./useSelectedBlockIds";
import { useCopyBlockIds } from "./useCopyBlockIds";
import { useRemoveBlocks } from "./useRemoveBlocks";
import { useDuplicateBlocks } from "./useDuplicateBlocks";
import { useCutBlockIds } from "./useCutBlockIds";
import { usePasteBlocks } from "./usePasteBlocks";
import { useCanvasHistory } from "./useCanvasHistory";

export const useKeyEventWatcher = () => {
  const [ids, setIds] = useSelectedBlockIds();
  const [, setCopyIds] = useCopyBlockIds();
  const removeBlocks = useRemoveBlocks();
  const duplicateBlocks = useDuplicateBlocks();
  const [, setCutIds] = useCutBlockIds();
  const { pasteBlocks } = usePasteBlocks();
  const { undo, redo } = useCanvasHistory();

  useHotkeys("esc", () => setIds([]), {}, [setIds]);
  useHotkeys("ctrl+c,command+c", () => setCopyIds(ids), {}, [ids, setCopyIds]);
  useHotkeys("ctrl+d,command+d", () => duplicateBlocks(ids), { preventDefault: true }, [ids, duplicateBlocks]);
  useHotkeys("ctrl+x,command+x", () => setCutIds(ids), {}, [ids, setCutIds]);
  useHotkeys("ctrl+v,command+v", () => (ids.length === 1 ? pasteBlocks(ids[0]) : null), {}, [ids, pasteBlocks]);
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

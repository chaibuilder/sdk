import { useAtom } from "jotai";
import { draggedBlockAtom } from "../components/canvas/dnd/atoms.ts";

export const useDraggedBlock = () => {
  const [draggedBlock, setDraggedBlockAtom] = useAtom(draggedBlockAtom);
  return [draggedBlock, setDraggedBlockAtom];
};

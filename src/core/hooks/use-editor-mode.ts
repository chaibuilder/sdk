import { atom, useAtom } from "jotai";

export const editorModeAtom = atom<"edit" | "view" | "preview">("edit");

export const useEditorMode = () => {
  const [mode, setMode] = useAtom(editorModeAtom);
  return { mode, setMode };
};

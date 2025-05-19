import { useBuilderProp } from "@/core/hooks";
import { builderSaveStateAtom } from "@/core/hooks/use-save-page";
import { useAtom, atom } from "jotai";
import { noop } from "lodash-es";
import { useEffect, useCallback, useMemo } from "react";
import UndoManager from "undo-manager";

const undoManager = new UndoManager();
undoManager.setLimit(50);

const undoRedoStateAtom = atom({
  canUndo: false,
  canRedo: false,
});

const useUndoManager = () => {
  const [, setSaveState] = useAtom(builderSaveStateAtom);
  const [undoRedoState, setUndoRedoState] = useAtom(undoRedoStateAtom);
  const emitSaveState = useBuilderProp("onSaveStateChange", noop);

  const updateUndoRedoState = useCallback(() => {
    const newState = {
      canUndo: undoManager.hasUndo(),
      canRedo: undoManager.hasRedo(),
    };
    setUndoRedoState(newState);
    setSaveState("UNSAVED");
    emitSaveState("UNSAVED");
  }, [setUndoRedoState, setSaveState, emitSaveState]);

  useEffect(() => {
    undoManager.setCallback(updateUndoRedoState);
    return () => {
      undoManager.setCallback(noop);
    };
  }, [updateUndoRedoState]);

  const add = useCallback(
    (action: any) => {
      undoManager.add(action);
      updateUndoRedoState();
    },
    [updateUndoRedoState],
  );

  const undo = useCallback(() => {
    undoManager.undo();
    updateUndoRedoState();
  }, [updateUndoRedoState]);

  const redo = useCallback(() => {
    undoManager.redo();
    updateUndoRedoState();
  }, [updateUndoRedoState]);

  const clear = useCallback(() => {
    undoManager.clear();
    setUndoRedoState({
      canUndo: false,
      canRedo: false,
    });
  }, [setUndoRedoState]);

  return useMemo(
    () => ({
      add,
      undo,
      redo,
      hasUndo: () => undoRedoState.canUndo,
      hasRedo: () => undoRedoState.canRedo,
      clear,
    }),
    [add, undo, redo, undoRedoState.canUndo, undoRedoState.canRedo, clear],
  );
};

export { useUndoManager };

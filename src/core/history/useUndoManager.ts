import UndoManager from "undo-manager";

const undoManager = new UndoManager();
undoManager.setLimit(50);

const useUndoManager = () => {
  return {
    add: undoManager.add,
    undo: undoManager.undo,
    redo: undoManager.redo,
    hasRedo: undoManager.hasRedo,
    hasUndo: undoManager.hasUndo,
    clear: undoManager.clear,
  };
};

export { useUndoManager };

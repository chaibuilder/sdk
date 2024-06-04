import UndoManager from "undo-manager";
import { useEffect } from "react";
import { noop } from "lodash-es";

const undoManager = new UndoManager();
undoManager.setLimit(10);

const useUndoManager = () => {
  useEffect(() => {
    undoManager.setCallback(() => {
      console.log("undoManager changed");
    });
    return () => {
      undoManager.setCallback(noop);
    };
  }, []);
  return { undoManager, hasRedo: undoManager.hasRedo(), hasUndo: undoManager.hasUndo(), clear: undoManager.clear() };
};

export { useUndoManager };

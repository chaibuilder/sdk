import { useAtom } from "jotai";
import { HistoryPayload, historyPayloadAtom } from "./historyPayload.ts";

const useUndo = () => {
  return (historyPayload: HistoryPayload) => {
    console.log("undo", historyPayload);
  };
};

const useRedo = () => {
  return (historyPayload: HistoryPayload) => {
    console.log("redo", historyPayload);
  };
};

export const useNewHistory = () => {
  const [history, setHistory] = useAtom(historyPayloadAtom);
  const undoFn = useUndo();
  const redoFn = useRedo();
  const redo = () => {
    if (history.future.length === 0) return;
    const next = history.future[history.future.length - 1];
    redoFn(next);
    const newFuture = history.future.slice(0, history.future.length - 1);

    setHistory((prev) => ({
      past: [...prev.past, next],
      future: newFuture,
    }));
  };

  const undo = () => {
    if (history.past.length === 0) return;
    const last = history.past[history.past.length - 1];
    undoFn(last);

    const newPast = history.past.slice(0, history.past.length - 1);

    setHistory((prev) => ({
      past: newPast,
      future: [...prev.future, last],
    }));
  };

  return {
    redo,
    undo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    queue: (historyPayload: HistoryPayload) => {
      // add to past
      setHistory((prev) => ({
        past: [...prev.past, historyPayload],
        future: [],
      }));
    },
  };
};

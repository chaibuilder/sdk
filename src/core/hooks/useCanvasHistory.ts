import { ActionCreators } from "redux-undo";
import { useCallback, useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import { useDispatch } from "./useTreeData";
import { pageBlocksAtom } from "../atoms/blocks";
import { usePreviewMode } from "./usePreviewMode";
import { pageSyncStateAtom } from "./useSavePage";
import { useBuilderProp } from "./useBuilderProp";
import { historyStatesAtom } from "../atoms/ui";
import { useSelectedBlockIds } from "./useSelectedBlockIds";
import { useSelectedStylingBlocks } from "./useSelectedStylingBlocks";

type CanvasHistory = {
  redoCount: number;
  undoCount: number;
  clear: Function;
  createSnapshot: Function;
  redo: Function;
  undo: Function;
};
/**
 *
 */
export const useCanvasHistory = (): CanvasHistory => {
  const blocks: any = useAtomValue(pageBlocksAtom);
  const [{ undoCount, redoCount }] = useAtom(historyStatesAtom);
  const dispatch = useDispatch();
  const [preview] = usePreviewMode();
  const [, setIds] = useSelectedBlockIds();
  const [, setStyleBlocks] = useSelectedStylingBlocks();
  const [syncState, setSyncState] = useAtom(pageSyncStateAtom);
  const onSyncStatusChange = useBuilderProp("onSyncStatusChange", () => {});

  const createSnapshot = useCallback(() => {
    // creates a snapshot of the current state
    dispatch({ type: "create_snapshot" });
  }, [dispatch]);

  useEffect(() => {
    if ((syncState === "SAVED" && undoCount !== blocks?.past.length) || redoCount !== blocks?.future.length) {
      setSyncState("UNSAVED");
      onSyncStatusChange("UNSAVED");
    }
  }, [blocks?.past.length, blocks?.future.length, undoCount, redoCount, onSyncStatusChange, setSyncState, syncState]);

  return {
    undoCount: blocks?.past.length,
    redoCount: blocks?.future.length,
    undo: useCallback(() => {
      if (preview) return;
      dispatch(ActionCreators.undo());
      setTimeout(() => {
        setStyleBlocks([]);
        setIds([]);
      }, 200);
    }, [dispatch, preview, setIds, setStyleBlocks]),

    redo: useCallback(() => {
      if (preview) return;
      dispatch(ActionCreators.redo());
      setTimeout(() => {
        setStyleBlocks([]);
        setIds([]);
      }, 200);
    }, [preview, dispatch, setStyleBlocks, setIds]),

    clear: () => {
      dispatch(ActionCreators.clearHistory());
    },
    createSnapshot,
  };
};

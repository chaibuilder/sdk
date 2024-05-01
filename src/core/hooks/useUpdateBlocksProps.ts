import { useCallback } from "react";
import { atom, useSetAtom } from "jotai";
import { useCanvasHistory } from "./useCanvasHistory";
import { useDispatch } from "./useTreeData";

type UpdateBlockProps = {
  blockIds: Array<string>;
  dispatch: any;
  props: { string: any };
};

export const updateBlocksPropsAtom: any = atom(null, (_get, _set, { blockIds, props, dispatch }: UpdateBlockProps) => {
  dispatch({
    type: "update_props_realtime",
    payload: { ids: blockIds, props },
  });
});

/**
 *
 */
export const useUpdateBlocksProps = () => {
  const { createSnapshot } = useCanvasHistory();
  const dispatch = useDispatch();
  const updateBlocksProps = useSetAtom(updateBlocksPropsAtom);
  return useCallback(
    (blockIds: Array<string>, props: Record<string, any>) => {
      updateBlocksProps({ blockIds, props, dispatch });
      createSnapshot();
    },
    [createSnapshot, dispatch, updateBlocksProps],
  );
};

export const useUpdateBlocksPropsRealtime = () => {
  const dispatch = useDispatch();
  const updateBlocksProps = useSetAtom(updateBlocksPropsAtom);
  return useCallback(
    (blockIds: Array<string>, props: { string: any }) => {
      updateBlocksProps({ blockIds, props, dispatch });
    },
    [dispatch, updateBlocksProps],
  );
};

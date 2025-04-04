import { atom, useAtom } from "jotai";
import { get, noop } from "lodash-es";
import { useCallback, useEffect, useRef } from "react";
import { ChaiUILibrary, ChaiUILibraryBlock } from "../../types/chaibuilder-editor-props";
import { useBuilderProp } from "../main";

const libraryBlocksAtom = atom<{ [uuid: string]: { loading: "idle" | "loading" | "complete"; blocks: any[] | null } }>(
  {},
);
export const useLibraryBlocks = (library?: Partial<ChaiUILibrary> & { id: string }) => {
  const [libraryBlocks, setLibraryBlocks] = useAtom(libraryBlocksAtom);
  const getBlocks = useBuilderProp("getUILibraryBlocks", noop);
  const blocks = get(libraryBlocks, `${library?.id}.blocks`, null);
  const state = get(libraryBlocks, `${library?.id}.loading`, "idle");
  const loadingRef = useRef("idle");
  useEffect(() => {
    (async () => {
      if (state === "complete" || loadingRef.current === "loading") return;
      loadingRef.current = "loading";
      setLibraryBlocks((prev) => ({ ...prev, [library?.id]: { loading: "loading", blocks: [] } }));
      const libraryBlocks: ChaiUILibraryBlock[] = await getBlocks(library);
      loadingRef.current = "idle";
      setLibraryBlocks((prev) => ({ ...prev, [library?.id]: { loading: "complete", blocks: libraryBlocks || [] } }));
    })();
  }, [library, blocks, state, loadingRef, setLibraryBlocks, getBlocks]);

  const resetLibrary = useCallback(() => {
    setLibraryBlocks((prev) => ({ ...prev, [library?.id]: { loading: "idle", blocks: [] } }));
  }, [library, setLibraryBlocks]);

  return { data: blocks || [], isLoading: state === "loading", resetLibrary };
};

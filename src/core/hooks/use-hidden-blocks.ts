import { atom, useAtom } from "jotai";
import { includes, without } from "lodash-es";
import { useCallback } from "react";

const hiddenBlockIdsAtom = atom<Array<string>>([]);

export const useHiddenBlockIds = () => {
  const [blockIds, setBlockIds] = useAtom(hiddenBlockIdsAtom);

  const toggleHidden = useCallback(
    (blockId: string) => {
      setBlockIds((prevIds) => (includes(prevIds, blockId) ? without(prevIds, blockId) : [...prevIds, blockId]));
    },
    [setBlockIds],
  );

  return [blockIds, setBlockIds, toggleHidden] as const;
};

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;
  const { renderHook, act } = await import("@testing-library/react");

  describe("useHiddenBlockIds", () => {
    it("should toggle hidden block IDs", () => {
      const { result } = renderHook(() => useHiddenBlockIds());

      expect(result.current[0]).toEqual([]);

      act(() => {
        result.current[2]("block1");
      });

      expect(result.current[0]).toEqual(["block1"]);

      act(() => {
        result.current[2]("block2");
      });

      expect(result.current[0]).toEqual(["block1", "block2"]);

      act(() => {
        result.current[2]("block1");
      });

      expect(result.current[0]).toEqual(["block2"]);
    });
  });
}

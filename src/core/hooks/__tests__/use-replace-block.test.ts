import { ChaiBlock } from "@/types/chai-block";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { replaceBlock, useReplaceBlock } from "../use-replace-block";

// Mock dependencies
vi.mock("@/core/history/use-blocks-store-undoable-actions", () => ({
  useBlocksStore: vi.fn(),
  useBlocksStoreUndoableActions: vi.fn(),
}));

vi.mock("@/core/hooks/use-selected-blockIds", () => ({
  useSelectedBlockIds: vi.fn(),
}));

vi.mock("@/core/main", () => ({
  PERMISSIONS: {
    EDIT_BLOCK: "EDIT_BLOCK",
  },
  usePermissions: vi.fn(),
}));

import { useBlocksStore, useBlocksStoreUndoableActions } from "@/core/history/use-blocks-store-undoable-actions";
import { useSelectedBlockIds } from "@/core/hooks/use-selected-blockIds";
import { usePermissions } from "@/core/main";

describe("replaceBlock", () => {
  it("should replace a block with replacement blocks", () => {
    const blocks: ChaiBlock[] = [
      { _id: "1", _parent: undefined, _type: "Container" },
      { _id: "2", _parent: "1", _type: "Text" },
      { _id: "3", _parent: "1", _type: "Button" },
    ];

    const replacementBlocks: ChaiBlock[] = [
      { _id: "4", _parent: undefined, _type: "Image" },
      { _id: "5", _parent: undefined, _type: "Video" },
    ];

    const result = replaceBlock(blocks, "2", replacementBlocks);

    expect(result).toHaveLength(4); // 3 original - 1 removed + 2 added
    expect(result.find((b) => b._id === "2")).toBeUndefined();
    expect(result.find((b) => b._id === "4")).toBeDefined();
    expect(result.find((b) => b._id === "5")).toBeDefined();
    expect(result.find((b) => b._id === "4")?._parent).toBe("1");
    expect(result.find((b) => b._id === "5")?._parent).toBe("1");
  });

  it("should preserve parent relationship for replacement blocks", () => {
    const blocks: ChaiBlock[] = [
      { _id: "1", _parent: undefined, _type: "Container" },
      { _id: "2", _parent: "1", _type: "Text" },
    ];

    const replacementBlocks: ChaiBlock[] = [{ _id: "3", _parent: "999", _type: "Image" }];

    const result = replaceBlock(blocks, "2", replacementBlocks);

    // Replacement block should inherit parent from the replaced block
    expect(result.find((b) => b._id === "3")?._parent).toBe("1");
  });

  it("should remove children of the replaced block", () => {
    const blocks: ChaiBlock[] = [
      { _id: "1", _parent: undefined, _type: "Container" },
      { _id: "2", _parent: "1", _type: "Section" },
      { _id: "3", _parent: "2", _type: "Text" },
      { _id: "4", _parent: "2", _type: "Button" },
    ];

    const replacementBlocks: ChaiBlock[] = [{ _id: "5", _parent: undefined, _type: "Image" }];

    const result = replaceBlock(blocks, "2", replacementBlocks);

    expect(result).toHaveLength(2); // Only block 1 and the new block 5
    expect(result.find((b) => b._id === "2")).toBeUndefined();
    expect(result.find((b) => b._id === "3")).toBeUndefined();
    expect(result.find((b) => b._id === "4")).toBeUndefined();
    expect(result.find((b) => b._id === "5")).toBeDefined();
  });

  it("should return original blocks if block to replace is not found", () => {
    const blocks: ChaiBlock[] = [
      { _id: "1", _parent: undefined, _type: "Container" },
      { _id: "2", _parent: "1", _type: "Text" },
    ];

    const replacementBlocks: ChaiBlock[] = [{ _id: "3", _parent: undefined, _type: "Image" }];

    const result = replaceBlock(blocks, "999", replacementBlocks);

    expect(result).toEqual(blocks);
    expect(result).toHaveLength(2);
  });

  it("should handle replacing top-level block", () => {
    const blocks: ChaiBlock[] = [
      { _id: "1", _parent: undefined, _type: "Container" },
      { _id: "2", _parent: "1", _type: "Text" },
    ];

    const replacementBlocks: ChaiBlock[] = [{ _id: "3", _parent: "999", _type: "Section" }];

    const result = replaceBlock(blocks, "1", replacementBlocks);

    expect(result).toHaveLength(1); // Block 1 and its child removed, block 3 added
    expect(result.find((b) => b._id === "1")).toBeUndefined();
    expect(result.find((b) => b._id === "2")).toBeUndefined();
    expect(result.find((b) => b._id === "3")?._parent).toBeUndefined();
  });

  it("should handle empty replacement blocks array", () => {
    const blocks: ChaiBlock[] = [
      { _id: "1", _parent: undefined, _type: "Container" },
      { _id: "2", _parent: "1", _type: "Text" },
    ];

    const result = replaceBlock(blocks, "2", []);

    expect(result).toHaveLength(1);
    expect(result.find((b) => b._id === "2")).toBeUndefined();
  });

  it("should handle multiple replacement blocks", () => {
    const blocks: ChaiBlock[] = [
      { _id: "1", _parent: undefined, _type: "Container" },
      { _id: "2", _parent: "1", _type: "Text" },
    ];

    const replacementBlocks: ChaiBlock[] = [
      { _id: "3", _parent: undefined, _type: "Image" },
      { _id: "4", _parent: undefined, _type: "Video" },
      { _id: "5", _parent: undefined, _type: "Button" },
    ];

    const result = replaceBlock(blocks, "2", replacementBlocks);

    expect(result).toHaveLength(4);
    expect(result.filter((b) => b._parent === "1")).toHaveLength(3);
  });
});

describe("useReplaceBlock", () => {
  const mockSetNewBlocks = vi.fn();
  const mockSetSelectedIds = vi.fn();
  const mockHasPermission = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useBlocksStore as any).mockReturnValue([
      [
        { _id: "1", _parent: undefined, _type: "Container" },
        { _id: "2", _parent: "1", _type: "Text" },
        { _id: "3", _parent: "1", _type: "Button" },
      ],
    ]);

    (useBlocksStoreUndoableActions as any).mockReturnValue({
      setNewBlocks: mockSetNewBlocks,
    });

    (useSelectedBlockIds as any).mockReturnValue([[], mockSetSelectedIds]);

    (usePermissions as any).mockReturnValue({
      hasPermission: mockHasPermission,
    });
  });

  it("should replace block when permission is granted", () => {
    mockHasPermission.mockReturnValue(true);

    const { result } = renderHook(() => useReplaceBlock());

    const replacementBlocks: ChaiBlock[] = [{ _id: "4", _parent: undefined, _type: "Image" }];

    act(() => {
      result.current("2", replacementBlocks);
    });

    expect(mockHasPermission).toHaveBeenCalledWith("EDIT_BLOCK");
    expect(mockSetNewBlocks).toHaveBeenCalled();

    const newBlocks = mockSetNewBlocks.mock.calls[0][0];
    expect(newBlocks.find((b: ChaiBlock) => b._id === "2")).toBeUndefined();
    expect(newBlocks.find((b: ChaiBlock) => b._id === "4")).toBeDefined();
  });

  it("should not replace block when permission is denied", () => {
    mockHasPermission.mockReturnValue(false);

    const { result } = renderHook(() => useReplaceBlock());

    const replacementBlocks: ChaiBlock[] = [{ _id: "4", _parent: undefined, _type: "Image" }];

    act(() => {
      result.current("2", replacementBlocks);
    });

    expect(mockHasPermission).toHaveBeenCalledWith("EDIT_BLOCK");
    expect(mockSetNewBlocks).not.toHaveBeenCalled();
    expect(mockSetSelectedIds).not.toHaveBeenCalled();
  });

  it("should select first replacement block after replace", () => {
    vi.useFakeTimers();
    mockHasPermission.mockReturnValue(true);

    const { result } = renderHook(() => useReplaceBlock());

    const replacementBlocks: ChaiBlock[] = [
      { _id: "4", _parent: undefined, _type: "Image" },
      { _id: "5", _parent: undefined, _type: "Video" },
    ];

    act(() => {
      result.current("2", replacementBlocks);
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(mockSetSelectedIds).toHaveBeenCalledWith(["4"]);

    vi.useRealTimers();
  });

  it("should not select any block if replacement blocks array is empty", () => {
    vi.useFakeTimers();
    mockHasPermission.mockReturnValue(true);

    const { result } = renderHook(() => useReplaceBlock());

    act(() => {
      result.current("2", []);
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(mockSetSelectedIds).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it("should handle replacing with multiple replacement blocks", () => {
    mockHasPermission.mockReturnValue(true);

    const { result } = renderHook(() => useReplaceBlock());

    const replacementBlocks: ChaiBlock[] = [
      { _id: "4", _parent: undefined, _type: "Image" },
      { _id: "5", _parent: undefined, _type: "Video" },
      { _id: "6", _parent: undefined, _type: "Text" },
    ];

    act(() => {
      result.current("2", replacementBlocks);
    });

    const newBlocks = mockSetNewBlocks.mock.calls[0][0];
    expect(newBlocks).toHaveLength(5); // 3 original - 1 removed + 3 added
  });
});

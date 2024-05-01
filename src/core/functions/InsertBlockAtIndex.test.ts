import { insertBlockAtIndex } from "./InsertBlockAtIndex.ts";

describe("insertBlockAtIndex", () => {
  it("should add new blocks to the end if parent doesn't exist", () => {
    const blocks = insertBlockAtIndex([{ _id: "1", _type: "Box" }], null, 1, [{ _id: "2", _type: "Box" }], true);
    expect(blocks).toEqual([
      { _id: "1", _type: "Box" },
      { _id: "2", _type: "Box" },
    ]);
  });

  it("should add new blocks at correct index if parent exists", () => {
    const blocks = insertBlockAtIndex(
      [{ _id: "1", _type: "Box", _parent: "0" }],
      "0",
      1,
      [{ _id: "2", _type: "Box" }],
      true,
    );
    expect(blocks).toEqual([
      { _id: "1", _type: "Box", _parent: "0" },
      { _id: "2", _type: "Box" },
    ]);
  });

  it("should add new blocks next to current selection if destination index is null", () => {
    const blocks = insertBlockAtIndex([{ _id: "1", _type: "Box" }], "1", null, [{ _id: "2", _type: "Box" }], false);
    expect(blocks).toEqual([
      { _id: "1", _type: "Box" },
      { _id: "2", _type: "Box" },
    ]);
  });

  it("should add new blocks at correct index if parent has children", () => {
    const blocks = insertBlockAtIndex(
      [
        { _id: "1", _type: "Box", _parent: "0" },
        { _id: "2", _type: "Box", _parent: "0" },
      ],
      "0",
      null,
      [{ _id: "3", _type: "Box" }],
      true,
    );
    expect(blocks).toEqual([
      { _id: "1", _type: "Box", _parent: "0" },
      { _id: "2", _type: "Box", _parent: "0" },
      { _id: "3", _type: "Box" },
    ]);
  });

  it("should return the same array if new blocks array is empty", () => {
    const blocks = insertBlockAtIndex([{ _id: "1", _type: "Box" }], "1", 0, [], true);
    expect(blocks).toEqual([{ _id: "1", _type: "Box" }]);
  });
});

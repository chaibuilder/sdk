import { insertBlocksAtPosition } from "./InsertBlocksAtPosition.ts";

describe("insertBlocksAtIndex", () => {
  it("should add new blocks to the end if parent doesn't exist", () => {
    const blocks = insertBlocksAtPosition([{ _id: "1", _type: "Box" }], [{ _id: "2", _type: "Box" }]);
    expect(blocks).toEqual([
      { _id: "1", _type: "Box" },
      { _id: "2", _type: "Box" },
    ]);
  });
});

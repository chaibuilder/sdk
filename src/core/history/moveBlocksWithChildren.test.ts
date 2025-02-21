import { convertToBlocksAtoms } from "../atoms/blocks.ts";
import { ChaiBlock } from "../types/ChaiBlock.ts";
import { moveBlocksWithChildren } from "./moveBlocksWithChildren.ts";

const mockUpdateBlockAtom = () => {};

test("Move to top level", () => {
  const blocks = [
    { _id: "1", _parent: undefined },
    { _id: "2", _parent: "1" },
    { _id: "3", _parent: "1" },
    { _id: "4", _parent: "2" },
    { _id: "5", _parent: "2" },
    { _id: "6", _parent: "3" },
  ] as ChaiBlock[];

  const idsToMove = ["2"];
  const newParent = undefined;
  const position = 1;

  const updatedBlocks = moveBlocksWithChildren(
    convertToBlocksAtoms(blocks),
    idsToMove[0],
    newParent,
    position,
    mockUpdateBlockAtom,
  );
  expect(updatedBlocks).toHaveLength(6);
});

test("Move to another parent", () => {
  const blocks = [
    { _id: "1", _parent: undefined },
    { _id: "2", _parent: "1" },
    { _id: "3", _parent: "1" },
    { _id: "4", _parent: "2" },
    { _id: "5", _parent: "2" },
    { _id: "6", _parent: "3" },
  ] as ChaiBlock[];

  const idsToMove = ["2"];
  const newParent = "3";
  const position = 0;

  const updatedBlocks = moveBlocksWithChildren(
    convertToBlocksAtoms(blocks),
    idsToMove[0],
    newParent,
    position,
    mockUpdateBlockAtom,
  );
  expect(updatedBlocks).toHaveLength(6);
});

test("Move block with children", () => {
  const blocks = [
    { _id: "1", _parent: undefined },
    { _id: "2", _parent: "1" },
    { _id: "4", _parent: "2" },
    { _id: "5", _parent: "2" },
    { _id: "3", _parent: "1" },
    { _id: "6", _parent: "3" },
  ] as ChaiBlock[];

  const idsToMove = ["2"];
  const newParent = undefined;
  const position = 0;

  const updatedBlocks = moveBlocksWithChildren(
    convertToBlocksAtoms(blocks),
    idsToMove[0],
    newParent,
    position,
    mockUpdateBlockAtom,
  );
  expect(updatedBlocks).toHaveLength(6);
  expect(updatedBlocks[0]._id).toBe("2");
  expect(updatedBlocks[0]._parent).toBe(null);
});

test("Move multiple blocks", () => {
  const blocks = [
    { _id: "1", _parent: undefined },
    { _id: "2", _parent: "1" },
    { _id: "3", _parent: "1" },
    { _id: "4", _parent: "2" },
    { _id: "5", _parent: "2" },
    { _id: "6", _parent: "3" },
    { _id: "7", _parent: "6" },
  ] as ChaiBlock[];

  const idsToMove = ["2", "6"];
  const newParent = undefined;
  const position = 0;

  let updatedBlocks = moveBlocksWithChildren(
    convertToBlocksAtoms(blocks),
    idsToMove[0],
    newParent,
    position,
    mockUpdateBlockAtom,
  );
  updatedBlocks = moveBlocksWithChildren(updatedBlocks, idsToMove[1], newParent, position, mockUpdateBlockAtom);
  expect(updatedBlocks).toHaveLength(7);
});

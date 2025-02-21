import { atom } from "jotai";
import { splitAtom } from "jotai/utils";
import { filter, has } from "lodash-es";
import { convertToBlocksTree } from "../functions/Blocks.ts";
import { ChaiBlock } from "../types/ChaiBlock.ts";
export const pageBlocksAtom = atom([]);
pageBlocksAtom.debugLabel = "pageBlocksAtom";

export const convertToBlocksAtoms = (blocks: ChaiBlock[]) => {
  return blocks.map((block) => ({
    _type: block._type,
    _id: block._id,
    _parent: block._parent ?? null,
    _atom: atom(block),
  }));
};

// derived atoms
// @ts-ignore
export const presentBlocksAtom = atom([]);
presentBlocksAtom.debugLabel = "presentBlocksAtom";

//TODO: Need a better name for this atom. Also should be a custom hook
export const treeDSBlocks = atom((get) => {
  const presentBlocks = get(presentBlocksAtom);
  return convertToBlocksTree([...presentBlocks]);
});
treeDSBlocks.debugLabel = "treeDSBlocks";

export const pageBlocksAtomsAtom = splitAtom(presentBlocksAtom);
pageBlocksAtomsAtom.debugLabel = "pageBlocksAtomsAtom";

export const blocksAsAtomsAtom = atom((get) => {
  const presentBlocks = get(presentBlocksAtom);
  return presentBlocks.map((block) => ({
    _type: block._type,
    _id: block._id,
    _parent: block._parent ?? null,
    atom: atom(block),
  }));
});
blocksAsAtomsAtom.debugLabel = "blocksAsAtomsAtom";

export const builderActivePageAtom = atom<string>("");
builderActivePageAtom.debugLabel = "builderActivePageAtom";

export const destinationDropIndexAtom = atom<number>(-1);
destinationDropIndexAtom.debugLabel = "destinationDropIndexAtom";

export const buildingBlocksAtom: any = atom<Array<any>>([]);
buildingBlocksAtom.debugLabel = "buildingBlocksAtom";

export const globalBlocksAtom = atom<Array<any>>((get) => {
  const globalBlocks = get(buildingBlocksAtom) as Array<any>;
  return filter(globalBlocks, (block) => has(block, "blockId"));
});
globalBlocksAtom.debugLabel = "globalBlocksAtom";

import { Atom, atom } from "jotai";
import { filter, has } from "lodash-es";
import { convertToBlocksTree } from "../functions/Blocks.ts";
import { ChaiBlock } from "../types/ChaiBlock.ts";

export type ChaiBuilderBlockWithAtom = {
  _type: string;
  _id: string;
  _parent: string | null;
  _atom: Atom<ChaiBlock>;
};

export const pageBlocksAtom = atom<ChaiBuilderBlockWithAtom[]>([]);
pageBlocksAtom.debugLabel = "pageBlocksAtom";

export const convertToBlocksAtoms = (blocks: ChaiBlock[]): ChaiBuilderBlockWithAtom[] => {
  return blocks.map((block) => ({
    _type: block._type,
    _id: block._id,
    _parent: block._parent ?? null,
    _atom: atom(block),
  })) as ChaiBuilderBlockWithAtom[];
};

//TODO: Need a better name for this atom. Also should be a custom hook
export const treeDSBlocks = atom((get) => {
  const presentBlocks = get(pageBlocksAtom).map((block) => get(block._atom));
  return convertToBlocksTree(presentBlocks);
});
treeDSBlocks.debugLabel = "treeDSBlocks";

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

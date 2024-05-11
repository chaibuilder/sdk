import { atom } from "jotai";
import { atomWithReducer, splitAtom } from "jotai/utils";
import { getBlocksTree } from "../functions/Blocks";
import { pageBlocksReducer } from "./reducer";
import { filter, has } from "lodash-es";

export const pageBlocksAtom: any = atomWithReducer(
  {
    past: [],
    present: [],
    future: [],
  },
  pageBlocksReducer,
);
pageBlocksAtom.debugLabel = "pageBlocksAtom";

// derived atoms
// @ts-ignore
export const presentBlocksAtom = atom((get) => get(pageBlocksAtom)?.present);
presentBlocksAtom.debugLabel = "presentBlocksAtom";
export const pageBlocksAtomsAtom = splitAtom(presentBlocksAtom);
pageBlocksAtomsAtom.debugLabel = "pageBlocksAtomsAtom";

export const pageBlocksTreeAtom = atom((get) => getBlocksTree(get(presentBlocksAtom)));
pageBlocksTreeAtom.debugLabel = "pageBlocksTreeAtom";

export const builderActivePageAtom = atom<string>("");
builderActivePageAtom.debugLabel = "builderActivePageAtom";

export const destinationDropIndexAtom = atom<number>(-1);
destinationDropIndexAtom.debugLabel = "destinationDropIndexAtom";

export const addBlocksModalAtom = atom(false);
addBlocksModalAtom.debugLabel = "addBlocksModalAtom";
export const buildingBlocksAtom: any = atom<Array<any>>([]);
buildingBlocksAtom.debugLabel = "buildingBlocksAtom";
export const globalBlocksAtom = atom<Array<any>>((get) => {
  const globalBlocks = get(buildingBlocksAtom) as Array<any>;
  return filter(globalBlocks, (block) => has(block, "blockId"));
});
globalBlocksAtom.debugLabel = "globalBlocksAtom";

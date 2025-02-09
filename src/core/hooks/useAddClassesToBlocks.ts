import { atom, useSetAtom } from "jotai";
import { filter, first, get as getProp, map } from "lodash-es";
import { useCallback } from "react";
import { twMerge } from "tailwind-merge";
import { pageBlocksAtomsAtom } from "../atoms/blocks";
import { STYLES_KEY } from "../constants/STRINGS.ts";
import { orderClassesByBreakpoint } from "../functions/orderClassesByBreakpoint.ts";
import { removeDuplicateClasses } from "../functions/removeDuplicateClasses.ts";
import { useBlocksStoreUndoableActions } from "../history/useBlocksStoreUndoableActions.ts";
import { ChaiBlock } from "../types/ChaiBlock";
import { getSplitChaiClasses } from "./getSplitClasses.ts";
import { selectedStylingBlocksAtom, TStyleBlock } from "./useSelectedStylingBlocks";

type Created = {
  blockIds: Array<string>;
  newClasses: Array<string>;
};

/**
 * Core Styling function
 * @param blockIds
 * @param newClasses
 */
export const addClassesToBlocksAtom: any = atom(null, (get, _set, { blockIds, newClasses }: Created) => {
  // @ts-ignore
  const blockAtoms = filter(get(pageBlocksAtomsAtom), (blockAtom) =>
    // @ts-ignore
    blockIds.includes(get(blockAtom)._id),
  );
  const styleBlock = first(get(selectedStylingBlocksAtom)) as TStyleBlock;
  return map(blockAtoms, (blockAtom) => {
    const block: ChaiBlock = get(blockAtom as any);
    const classesString: string = getProp(block, styleBlock.prop, `${STYLES_KEY},`);
    const { classes } = getSplitChaiClasses(classesString);
    return {
      ids: [block._id],
      props: {
        [styleBlock.prop]: `${STYLES_KEY},${orderClassesByBreakpoint(
          removeDuplicateClasses(twMerge(classes, newClasses)),
        )}`,
      },
    };
  });
});

export const useAddClassesToBlocks = () => {
  const addClassesToBlocks = useSetAtom(addClassesToBlocksAtom);
  const { updateBlocks, updateBlocksRuntime } = useBlocksStoreUndoableActions();
  return useCallback(
    (blockIds: Array<string>, newClasses: Array<string>, undo: boolean = false) => {
      const blocks = addClassesToBlocks({ blockIds, newClasses });
      if (!undo) {
        updateBlocksRuntime(blockIds, blocks[0].props);
        return;
      }
      updateBlocks(blockIds, blocks[0].props);
    },
    [addClassesToBlocks, updateBlocks, updateBlocksRuntime],
  );
};

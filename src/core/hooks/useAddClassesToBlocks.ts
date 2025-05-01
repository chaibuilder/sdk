import { atom, useSetAtom } from "jotai";
import { filter, first, get as getProp, map } from "lodash-es";
import { useCallback } from "react";
import { pageBlocksAtomsAtom } from "../atoms/blocks";
import { STYLES_KEY } from "../constants/STRINGS.ts";
import { useBlocksStoreUndoableActions } from "../history/useBlocksStoreUndoableActions.ts";
import { ChaiBlock } from "../types/ChaiBlock";
import { selectedStylingBlocksAtom, TStyleBlock } from "./useSelectedStylingBlocks";
import { twMerge } from "tailwind-merge";
import { ClassDerivedObject, constructClassObject } from "../functions/Class.ts";

type Created = {
  blockIds: Array<string>;
  dispatch: (action: any) => void;
  newClasses: Array<string>;
};

export const getSplitChaiClasses = (classesString: string): { baseClasses: string; classes: string } => {
  classesString = classesString.replace(STYLES_KEY, "");
  if (!classesString) return { baseClasses: "", classes: "" };

  // Split by comma, but not within square brackets
  const parts = classesString.split(/,(?![^[]*\])/);

  // If there's only one part, return it as classes
  if (parts.length === 1) {
    return { baseClasses: "", classes: parts[0].trim() };
  }

  const [baseClasses, ...rest] = parts;
  return {
    baseClasses: baseClasses.trim(),
    classes: rest
      .join(",")
      .trim()
      .replace(/ +(?= )/g, ""),
  };
};

export function orderClassesByBreakpoint(classes: string): string {
  //sanitize the classes
  classes = classes.replace(/\s+/g, " ");
  const classesArray = classes.split(" ").map(constructClassObject);
  const breakpointOrder = ["xs", "sm", "md", "lg", "xl", "2xl"];
  return classesArray
    .sort((a, b) => {
      return breakpointOrder.indexOf(a.mq) - breakpointOrder.indexOf(b.mq);
    })
    .map((cls) => cls.fullCls)
    .join(" ");
}

export function removeDuplicateClasses(classes: string): string {
  classes = classes.replace(/\s+/g, " ");
  if (!classes) return "";

  // breakpoint order
  const breakpointOrder = ["xs", "sm", "md", "lg", "xl", "2xl"];

  const classesArray: ClassDerivedObject[] = classes.split(" ").map(constructClassObject);
  let filteredClasses: string = classes;
  if (classesArray.length === 1) return classesArray[0].fullCls;

  for (const cls of classesArray) {
    const property = cls.property;
    const order = breakpointOrder.indexOf(cls.mq);
    for (let i = order + 1; i < breakpointOrder.length; i++) {
      const breakpoint = breakpointOrder[i];
      const clsObj = classesArray.find((cls) => cls.property === property && cls.mq === breakpoint);
      if (clsObj && clsObj.cls === cls.cls) {
        filteredClasses = filteredClasses.replace(clsObj.fullCls, "");
      } else if (clsObj && clsObj.cls !== cls.cls) {
        break;
      }
    }
  }
  return filteredClasses.replace(/\s+/g, " ").trim();
}

/**
 * Core Styling function
 * @param blockIds
 * @param newClasses
 * @param dispatch
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
    const { baseClasses, classes } = getSplitChaiClasses(classesString);
    console.log(orderClassesByBreakpoint(removeDuplicateClasses(twMerge(classes, baseClasses, newClasses))));
    return {
      ids: [block._id],
      props: {
        [styleBlock.prop]: `${STYLES_KEY},${orderClassesByBreakpoint(removeDuplicateClasses(twMerge(classes, baseClasses, newClasses)))}`,
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

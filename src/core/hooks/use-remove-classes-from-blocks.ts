import { pageBlocksAtomsAtom } from "@/core/atoms/blocks";
import { STYLES_KEY } from "@/core/constants/STRINGS";
import { useBlocksStoreUndoableActions } from "@/core/history/use-blocks-store-undoable-actions";
import { getSplitChaiClasses } from "@/core/hooks/get-split-classes";
import { selectedStylingBlocksAtom, TStyleBlock } from "@/core/hooks/use-selected-styling-blocks";
import { ChaiBlock } from "@/types/chai-block";
import { atom, useSetAtom } from "jotai";
import { each, filter, first, get as getProp, includes, map } from "lodash-es";
import { useCallback } from "react";

export const removeClassFromBlocksAtom: any = atom(null, (get, _set, { blockIds, fullClasses }) => {
  const styleBlock = first(get(selectedStylingBlocksAtom)) as TStyleBlock;
  const blockAtoms = filter(get(pageBlocksAtomsAtom), (blockAtom) =>
    // @ts-ignore
    blockIds.includes(get(blockAtom)._id),
  );

  return map(blockAtoms, (blockAtom) => {
    const block: ChaiBlock = get(blockAtom as any);
    const nonDynamicClasses: string[] = fullClasses;
    // eslint-disable-next-line prefer-const
    let { classes, baseClasses } = getSplitChaiClasses(getProp(block, styleBlock.prop, `${STYLES_KEY},`));

    each(nonDynamicClasses, (fullCls: string) => {
      const escapedClass = fullCls.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regEx = new RegExp(`(^|\\s)${escapedClass}(?=\\s|$)`, "g");
      classes = classes.replace(regEx, " ").replace(/\s+/g, " ").trim();
      const mq = first(fullCls.split(":"));
      if (includes(["2xl", "xl", "lg", "md", "sm"], mq)) {
        nonDynamicClasses.push((fullCls.split(":").pop() as string).trim());
      }
    });

    each(nonDynamicClasses, (fullCls: string) => {
      const escapedClass = fullCls.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regEx = new RegExp(`(^|\\s)${escapedClass}(?=\\s|$)`, "g");
      baseClasses = baseClasses.replace(regEx, " ").replace(/\s+/g, " ").trim();
    });

    return {
      ids: [block._id],
      props: {
        [styleBlock.prop]: `${STYLES_KEY}${baseClasses},${classes}`,
      },
    };
  });
});

export const useRemoveClassesFromBlocks = (): Function => {
  const { updateBlocks, updateBlocksRuntime } = useBlocksStoreUndoableActions();
  const removeClassesFromBlocks = useSetAtom(removeClassFromBlocksAtom);
  return useCallback(
    (blockIds: Array<string>, fullClasses: Array<string>, undo: boolean = false) => {
      const blocks = removeClassesFromBlocks({ blockIds, fullClasses });
      if (!undo) {
        updateBlocksRuntime(blockIds, blocks[0].props);
      } else {
        updateBlocks(blockIds, blocks[0].props);
      }
    },
    [removeClassesFromBlocks],
  );
};

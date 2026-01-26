import { canAcceptChildBlock } from "@/core/functions/block-helpers";
import { generateUUID } from "@/core/functions/common-functions";
import { useBlocksStore, useBlocksStoreUndoableActions } from "@/hooks/history/use-blocks-store-undoable-actions";
import { useSelectedBlockIds } from "@/hooks/use-selected-blockIds";
import { usePartialBlocksStore } from "@/hooks/use-partial-blocks-store";
import { checkCircularDependency } from "@/render/functions";
import { getDefaultBlockProps } from "@/runtime";
import { ChaiBlock, ChaiCoreBlock } from "@/types/common";
import { filter, find, first, forEach, has } from "lodash-es";
import { useCallback } from "react";

// Delay before selecting a newly added block to ensure the block is rendered in the DOM
// and the state has been updated before attempting to highlight it
const BLOCK_SELECTION_DELAY_MS = 100;

type AddBlocks = {
  addCoreBlock: any;
  addPredefinedBlock: any;
};

/**
 * Get the partial block ID that contains the given block
 * Returns undefined if the block is not inside a partial
 */
function getContainingPartialId(blockId: string | undefined | null, allBlocks: ChaiBlock[]): string | undefined {
  if (!blockId) return undefined;

  // Walk up the parent chain to find if we're inside a partial block
  let currentId: string | undefined | null = blockId;
  const visited = new Set<string>();

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const currentBlock: ChaiBlock | undefined = find(allBlocks, { _id: currentId });

    if (!currentBlock) break;

    // Check if this block is a partial block definition
    // In the editor, we need to check the page context to determine if we're editing a partial
    // For now, we'll check if the block has a partialBlockId property
    // This is a heuristic and may need adjustment based on actual usage
    if (currentBlock._type === "PartialBlock" || currentBlock._type === "GlobalBlock") {
      // If we found a partial reference, we're not editing within a partial definition
      break;
    }

    currentId = currentBlock._parent;
  }

  return undefined;
}

export const useAddBlock = (): AddBlocks => {
  const [allBlocks] = useBlocksStore();
  const [, setSelected] = useSelectedBlockIds();
  const { addBlocks } = useBlocksStoreUndoableActions();
  const { getPartailBlocks } = usePartialBlocksStore();

  const addPredefinedBlock = useCallback(
    (blocks: ChaiBlock[], parentId?: string, position?: number) => {
      // Build partials map from store for circular dependency checking
      const partialsMap: Record<string, ChaiBlock[]> = {};
      allBlocks.forEach((block) => {
        const partialId = block.partialBlockId || (block as any).globalBlock;
        if (partialId) {
          const partialBlocks = getPartailBlocks(partialId);
          if (partialBlocks.length > 0) {
            partialsMap[partialId] = partialBlocks;
          }
        }
      });

      // Check if we're adding blocks inside a partial definition
      const containingPartialId = getContainingPartialId(parentId, allBlocks);

      // Check for circular dependencies
      const circularCheck = checkCircularDependency(blocks, containingPartialId, partialsMap);
      if (circularCheck.hasCircularDependency) {
        throw new Error(circularCheck.error || "Circular dependency detected");
      }

      for (let i = 0; i < blocks.length; i++) {
        const { _id } = blocks[i];

        blocks[i]._id = generateUUID();
        const children = filter(blocks, { _parent: _id });
        for (let j = 0; j < children.length; j++) {
          children[j]._parent = blocks[i]._id;
        }
      }
      const block = first(blocks)!;
      let parentBlock;
      let parentBlockId;
      if (parentId) {
        parentBlock = find(allBlocks, { _id: parentId }) as ChaiBlock;
        blocks[0]._parent = parentId;
        forEach(blocks, (block) => {
          if (!block?._parent) block._parent = parentId;
        });
        parentBlockId = parentId;
      }

      const canAdd = parentBlock ? canAcceptChildBlock(parentBlock?._type, block._type) : true;
      if (!canAdd && parentBlock) {
        blocks[0]._parent = parentBlock._parent;
        parentBlockId = parentBlock._parent;
      }

      addBlocks(blocks, parentBlockId ?? undefined, position);
      setSelected([block._id]);
      return block;
    },
    [addBlocks, allBlocks, setSelected, getPartailBlocks],
  );

  const addCoreBlock = useCallback(
    (coreBlock: ChaiCoreBlock, parentId?: string | null, position?: number) => {
      if (has(coreBlock, "blocks")) {
        const blocks = coreBlock.blocks as ChaiBlock[];
        return addPredefinedBlock(blocks, parentId ?? undefined, position);
      }

      const blockId = generateUUID();
      const props: { [key: string]: any } = getDefaultBlockProps(coreBlock.type);

      const newBlock: ChaiBlock = {
        _type: coreBlock.type,
        _id: blockId,
        ...props,
        ...(has(coreBlock, "_name") && { _name: coreBlock._name }),
        ...(has(coreBlock, "partialBlockId") && { partialBlockId: coreBlock.partialBlockId }),
      };

      // Check for circular dependencies if this is a partial block
      if (newBlock._type === "PartialBlock" || newBlock._type === "GlobalBlock") {
        const partialsMap: Record<string, ChaiBlock[]> = {};
        allBlocks.forEach((block) => {
          const partialId = block.partialBlockId || (block as any).globalBlock;
          if (partialId) {
            const partialBlocks = getPartailBlocks(partialId);
            if (partialBlocks.length > 0) {
              partialsMap[partialId] = partialBlocks;
            }
          }
        });

        const containingPartialId = getContainingPartialId(parentId ?? undefined, allBlocks);
        const circularCheck = checkCircularDependency([newBlock], containingPartialId, partialsMap);
        if (circularCheck.hasCircularDependency) {
          throw new Error(circularCheck.error || "Circular dependency detected");
        }
      }

      let parentBlock;
      let parentBlockId;
      if (parentId) {
        parentBlock = find(allBlocks, { _id: parentId }) as ChaiBlock;
        newBlock._parent = parentId;
        parentBlockId = parentId;
      }

      const canAdd = canAcceptChildBlock(parentBlock?._type!, newBlock._type);
      if (!canAdd && parentBlock) {
        newBlock._parent = parentBlock._parent;
        parentBlockId = parentBlock._parent;
      }
      const newBlocks: ChaiBlock[] = [newBlock];

      addBlocks(newBlocks, parentBlockId ?? undefined, position);
      setTimeout(() => setSelected([newBlock._id]), BLOCK_SELECTION_DELAY_MS);
      return newBlock;
    },
    [addBlocks, addPredefinedBlock, allBlocks, setSelected, getPartailBlocks],
  );

  return { addCoreBlock, addPredefinedBlock };
};

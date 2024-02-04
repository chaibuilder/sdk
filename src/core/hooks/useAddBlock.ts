import { useCallback } from "react";
import { filter, find, first, forIn, has, startsWith } from "lodash";
import { useDispatch } from "./useTreeData";
import { generateUUID } from "../functions/functions";
import { canAddChildBlock } from "../functions/Layers";
import { useSelectedBlockIds } from "./useSelectedBlockIds";
import { ChaiBlock } from "../types/ChaiBlock";
import { CoreBlock } from "../types/CoreBlock";
import { getBlockDefaultProps } from "../functions/controls";
import { SLOT_KEY } from "../constants/CONTROLS";
import { useAllBlocks } from "./useAllBlocks";
import { insertBlockAtIndex } from "../functions/InsertBlockAtIndex";

type AddBlocks = {
  addCoreBlock: any;
  addPredefinedBlock: any;
};

export const useAddBlock = (): AddBlocks => {
  const dispatch = useDispatch();
  const allBlocks = useAllBlocks();
  const [, setSelected] = useSelectedBlockIds();

  const addPredefinedBlock = useCallback(
    (blocks: ChaiBlock[], parentId?: string, index?: number) => {
      // eslint-disable-next-line no-param-reassign
      for (let i = 0; i < blocks.length; i++) {
        const { _id } = blocks[i];
        // eslint-disable-next-line no-param-reassign
        blocks[i]._id = generateUUID();
        const children = filter(blocks, { _parent: _id });
        for (let j = 0; j < children.length; j++) {
          children[j]._parent = blocks[i]._id;
        }
      }
      let parentBlock;
      if (parentId) {
        parentBlock = find(allBlocks, { _id: parentId }) as ChaiBlock;
        blocks[0]._parent = parentId;
      }
      const canAdd = parentBlock ? canAddChildBlock(parentBlock._type) : true;
      if (!canAdd && parentBlock) {
        blocks[0]._parent = parentBlock._parent;
      }
      dispatch({
        type: "set_blocks",
        payload: insertBlockAtIndex(allBlocks, parentId || null, index || null, blocks, canAdd),
      });
      setSelected([first(blocks)?._id]);
      return first(blocks);
    },
    [allBlocks, dispatch, setSelected],
  );

  const addCoreBlock = useCallback(
    (coreBlock: CoreBlock, parentId?: string, index?: number) => {
      if (has(coreBlock, "blocks")) {
        const blocks = coreBlock.blocks as ChaiBlock[];
        return addPredefinedBlock(blocks, parentId, index);
      }

      const blockId = generateUUID();
      const props: { [key: string]: any } = getBlockDefaultProps(coreBlock.props);
      const slots: ChaiBlock[] = [];
      forIn(props, (value: any, key) => {
        if (startsWith(value, SLOT_KEY)) {
          const slotId = value.replace(SLOT_KEY, "");
          slots.push({
            _id: slotId,
            _type: "Slot",
            _parent: blockId,
            _name: coreBlock.props[key].name,
            _styles: coreBlock.props[key].styles,
            _emptyStyles: coreBlock.props[key].emptyStyles,
          });
        }
      });

      const newBlock: ChaiBlock = {
        _type: coreBlock.type,
        _id: blockId,
        ...props,
      };
      let parentBlock;
      if (parentId) {
        parentBlock = find(allBlocks, { _id: parentId }) as ChaiBlock;
        newBlock._parent = parentId;
      }
      const canAdd = parentBlock ? canAddChildBlock(parentBlock._type) : true;
      if (!canAdd && parentBlock) {
        newBlock._parent = parentBlock._parent;
      }
      const newBlocks: ChaiBlock[] = [newBlock, ...slots];
      dispatch({
        type: "set_blocks",
        payload: insertBlockAtIndex(allBlocks, parentId || null, index || null, newBlocks, canAdd),
      });
      setSelected([newBlock._id]);
      return newBlock;
    },
    [addPredefinedBlock, allBlocks, dispatch, setSelected],
  );

  return { addCoreBlock, addPredefinedBlock };
};

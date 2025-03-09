import { get, filter, findIndex } from "lodash-es";
import { CHAI_BUILDER_EVENTS, ChaiBlock, emitChaiBuilderMsg, useBlocksStore } from "../../main";
import { canAddChildBlock } from "../../functions/block-helpers";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../ui";

/**
 *
 * @param params
 * @returns Add block dropdown [as child, before, after]
 */
const AddBlockDropdown = ({ block, children }: { block: ChaiBlock; children: any }) => {
  // * all blocks
  const [blocks] = useBlocksStore();

  // * Parent Block
  const blockId = get(block, "_id");
  const parentBlockId = get(block, "_parent");

  // * Ancestor Blocks
  const ancestorBlocks = filter(blocks, (thisBlock: ChaiBlock) => {
    if (!parentBlockId) return !get(thisBlock, "_parent");
    return get(thisBlock, "_parent") === parentBlockId;
  });

  // * Current Block Details
  const canAddChild = canAddChildBlock(get(block, "_type", ""));
  const blockIndex = findIndex(ancestorBlocks, { _id: blockId });

  // * Function to add blocks
  const addBlock = (type: "CHILD" | "BEFORE" | "AFTER") => {
    if (type === "CHILD") {
      emitChaiBuilderMsg({ name: CHAI_BUILDER_EVENTS.OPEN_ADD_BLOCK, data: block });
    } else {
      const options = {
        name: CHAI_BUILDER_EVENTS.OPEN_ADD_BLOCK,
        data: { _id: parentBlockId || "", position: ancestorBlocks?.length },
      };
      if (type === "BEFORE") {
        options.data.position = Math.max(blockIndex, 0);
      } else if (type === "AFTER") {
        options.data.position = blockIndex + 1;
      }
      emitChaiBuilderMsg(options);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="border border-blue-200 shadow-2xl">
        {canAddChild && (
          <DropdownMenuItem className="cursor-pointer" onClick={() => addBlock("CHILD")}>
            Add child block
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="cursor-pointer" onClick={() => addBlock("BEFORE")}>
          Add block before
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => addBlock("AFTER")}>
          Add block after
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AddBlockDropdown;

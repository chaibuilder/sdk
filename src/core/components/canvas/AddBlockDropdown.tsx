import { filter, findIndex, get } from "lodash-es";
import { useTranslation } from "react-i18next";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../ui";
import { canAddChildBlock } from "../../functions/block-helpers";
import { CHAI_BUILDER_EVENTS, ChaiBlock, emitChaiBuilderMsg, useBlocksStore } from "../../main";
/**
 *
 * @param params
 * @returns Add block dropdown [as child, before, after]
 */
const AddBlockDropdown = ({ block, children }: { block: ChaiBlock; children: any }) => {
  // * all blocks
  const [blocks] = useBlocksStore();
  const { t } = useTranslation();

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
      <DropdownMenuContent className="w-fit border border-blue-200 bg-blue-500 text-white shadow-2xl">
        {canAddChild && (
          <DropdownMenuItem className="cursor-pointer text-xs" onClick={() => addBlock("CHILD")}>
            {t("Add inside")}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="cursor-pointer text-xs" onClick={() => addBlock("BEFORE")}>
          {t("Add before")}
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer text-xs" onClick={() => addBlock("AFTER")}>
          {t("Add after")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AddBlockDropdown;

import { filter, findIndex, get } from "lodash-es";
import { useTranslation } from "react-i18next";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../ui";
import { canAddChildBlock } from "../../functions/block-helpers";
import { CHAI_BUILDER_EVENTS, ChaiBlock, PERMISSIONS, useBlocksStore, usePermissions } from "../../main";
import { pubsub } from "../../pubsub";
/**
 *
 * @param params
 * @returns Add block dropdown [as child, before, after]
 */
const AddBlockDropdown = ({ block, children }: { block: ChaiBlock; children: any }) => {
  const { t } = useTranslation();
  // * all blocks
  const [blocks] = useBlocksStore();
  const { hasPermission } = usePermissions();

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
      pubsub.publish(CHAI_BUILDER_EVENTS.OPEN_ADD_BLOCK, block);
    } else {
      const options = { _id: parentBlockId || "", position: ancestorBlocks?.length };
      if (type === "BEFORE") {
        options.position = Math.max(blockIndex, 0);
      } else if (type === "AFTER") {
        options.position = blockIndex + 1;
      }
      pubsub.publish(CHAI_BUILDER_EVENTS.OPEN_ADD_BLOCK, options);
    }
  };

  if (!hasPermission(PERMISSIONS.ADD_BLOCK)) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="border border-blue-500 bg-blue-500 text-white shadow-2xl">
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

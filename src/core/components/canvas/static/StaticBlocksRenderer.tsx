import { filter, isEmpty } from "lodash-es";
import { useBlocksStore } from "../../../history/useBlocksStoreUndoableActions.ts";
import { ChaiBlock } from "../../../types/ChaiBlock.ts";
import { BlocksRendererStatic } from "./BlocksRenderer";

export const StaticBlocksRenderer = () => {
  const [blocks] = useBlocksStore();

  const blocksHtml = isEmpty(blocks) ? null : (
    <BlocksRendererStatic allBlocks={blocks} blocks={filter(blocks, (block: ChaiBlock) => isEmpty(block._parent))} />
  );

  return <>{blocksHtml}</>;
};

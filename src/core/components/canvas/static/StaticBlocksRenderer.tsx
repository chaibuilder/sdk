import { useFeature } from "flagged";
import { filter, isEmpty } from "lodash-es";
import { useBlocksStore } from "../../../history/useBlocksStoreUndoableActions.ts";
import { ChaiBlock } from "../../../types/ChaiBlock.ts";
import { BlocksRendererStatic } from "./BlocksRenderer";
import { NewBlocksRenderer } from "./NewBlocksRenderer";

export const StaticBlocksRenderer = () => {
  const [blocks] = useBlocksStore();
  const binding = useFeature("binding");
  const blocksHtml = isEmpty(blocks) ? null : binding ? (
    <NewBlocksRenderer />
  ) : (
    <BlocksRendererStatic allBlocks={blocks} blocks={filter(blocks, (block: ChaiBlock) => isEmpty(block._parent))} />
  );

  return <>{blocksHtml}</>;
};

import { filter, isEmpty } from "lodash-es";
import { BlocksRendererStatic } from "./BlocksRenderer";
import { BlocksExternalDataProvider } from "./BlocksExternalDataProvider.tsx";
import { useBlocksStore } from "../../../history/useBlocksStoreUndoableActions.ts";
import { ChaiBlock } from "../../../types/ChaiBlock.ts";

export const StaticBlocksRenderer = () => {
  const [blocks] = useBlocksStore();

  const blocksHtml = isEmpty(blocks) ? null : (
    <BlocksExternalDataProvider>
      <BlocksRendererStatic allBlocks={blocks} blocks={filter(blocks, (block: ChaiBlock) => isEmpty(block._parent))} />
    </BlocksExternalDataProvider>
  );

  return <>{blocksHtml}</>;
};

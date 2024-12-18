import { filter, isEmpty } from "lodash-es";
import { BlocksRendererStatic } from "./BlocksRenderer";
import { BlocksExternalDataProvider } from "./BlocksExternalDataProvider.tsx";
import { useBlocksStore } from "../../../history/useBlocksStoreUndoableActions.ts";
import { ChaiBlock } from "../../../types/ChaiBlock.ts";

export const StaticBlocksRenderer = () => {
  const [blocks] = useBlocksStore();

  const blocksHtml = isEmpty(blocks) ? (
    <div
      data-dnd="yes"
      data-dnd-dragged="no"
      id="chaibuilder-canvas-blank-screen"
      data-block-id="chaibuilder-canvas-blank-screen"
      className={`flex h-full w-full items-center justify-center text-xs text-slate-400 lg:text-xl`}>
      Get started by adding your first block!
    </div>
  ) : (
    <BlocksExternalDataProvider>
      <BlocksRendererStatic allBlocks={blocks} blocks={filter(blocks, (block: ChaiBlock) => isEmpty(block._parent))} />
    </BlocksExternalDataProvider>
  );

  return <>{blocksHtml}</>;
};

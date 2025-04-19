import { PageBlocksRenderer } from "@/core/components/canvas/static/NewBlocksRenderer";
import { useBlocksStore } from "@/core/history/useBlocksStoreUndoableActions";
import { isEmpty } from "lodash-es";

export const StaticBlocksRenderer = () => {
  const [blocks] = useBlocksStore();
  const blocksHtml = isEmpty(blocks) ? null : <PageBlocksRenderer />;
  return <>{blocksHtml}</>;
};

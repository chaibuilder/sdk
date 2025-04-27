import { PageBlocksRenderer } from "@/core/components/canvas/static/new-blocks-renderer";
import { useBlocksStore } from "@/core/history/use-blocks-store-undoable-actions";
import { isEmpty } from "lodash-es";

export const StaticBlocksRenderer = () => {
  const [blocks] = useBlocksStore();
  const blocksHtml = isEmpty(blocks) ? null : <PageBlocksRenderer />;
  return <>{blocksHtml}</>;
};

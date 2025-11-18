import { canvasRenderKeyAtom } from "@/core/components/canvas/dnd/drag-and-drop/hooks/use-drag-and-drop";
import { PageBlocksRenderer } from "@/core/components/canvas/static/new-blocks-renderer";
import { useBlocksStore } from "@/core/history/use-blocks-store-undoable-actions";
import { useAtom } from "jotai";
import { isEmpty } from "lodash-es";

export const StaticBlocksRenderer = () => {
  const [blocks] = useBlocksStore();
  const [renderKey] = useAtom(canvasRenderKeyAtom);
  const blocksHtml = isEmpty(blocks) ? null : <PageBlocksRenderer key={renderKey} />;
  return <>{blocksHtml}</>;
};

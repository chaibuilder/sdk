import { isEmpty } from "lodash-es";
import { useBlocksStore } from "../../../history/useBlocksStoreUndoableActions.ts";
import { PageBlocksRenderer } from "./NewBlocksRenderer";

export const StaticBlocksRenderer = () => {
  const [blocks] = useBlocksStore();
  const blocksHtml = isEmpty(blocks) ? null : <PageBlocksRenderer />;
  return <>{blocksHtml}</>;
};

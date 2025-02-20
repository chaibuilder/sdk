import { isEmpty } from "lodash-es";
import { useBlocksStore } from "../../../history/useBlocksStoreUndoableActions.ts";
import { NewBlocksRenderer } from "./NewBlocksRenderer";

export const StaticBlocksRenderer = () => {
  const [blocks] = useBlocksStore();
  const blocksHtml = isEmpty(blocks) ? null : <NewBlocksRenderer />;
  return <>{blocksHtml}</>;
};

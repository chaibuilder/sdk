import { filter, isEmpty } from "lodash-es";
import { Provider } from "react-wrap-balancer";
import { BlocksRendererStatic } from "./BlocksRenderer";
import { BlocksExternalDataProvider } from "./BlocksExternalDataProvider.tsx";
import { useBlocksStore } from "../../../history/useBlocksStoreUndoableActions.ts";

export const StaticBlocksRenderer = () => {
  const [blocks] = useBlocksStore();

  const blocksHtml = isEmpty(blocks) ? null : (
    <BlocksExternalDataProvider>
      <BlocksRendererStatic blocks={filter(blocks, (block) => isEmpty(block._parent))} />
    </BlocksExternalDataProvider>
  );

  return <Provider>{blocksHtml}</Provider>;
};

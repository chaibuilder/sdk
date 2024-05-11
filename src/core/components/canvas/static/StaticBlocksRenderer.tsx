import { filter, isEmpty } from "lodash-es";
import { Provider } from "react-wrap-balancer";
import { useAllBlocks } from "../../../hooks";
import { BlocksRendererStatic } from "./BlocksRenderer";
import { BlocksExternalDataProvider } from "./BlocksExternalDataProvider.tsx";

export const StaticBlocksRenderer = () => {
  const blocks = useAllBlocks();
  return (
    <Provider>
      {isEmpty(blocks) ? null : (
        <BlocksExternalDataProvider>
          <BlocksRendererStatic blocks={filter(blocks, (block) => isEmpty(block._parent))} />
        </BlocksExternalDataProvider>
      )}
    </Provider>
  );
};

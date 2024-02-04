import { filter, isEmpty } from "lodash";
import { Provider } from "react-wrap-balancer";
import { useAllBlocks } from "../../../hooks";
import { EmptyCanvas } from "../EmptyCanvas";
import { BlocksRendererStatic } from "./BlocksRenderer";
import { BlocksExternalDataProvider } from "./BlocksExternalDataProvider.tsx";

export const StaticBlocksRenderer = () => {
  const blocks = useAllBlocks();
  return (
    <Provider>
      {isEmpty(blocks) ? (
        <EmptyCanvas />
      ) : (
        <BlocksExternalDataProvider>
          <BlocksRendererStatic blocks={filter(blocks, (block) => isEmpty(block._parent))} />
        </BlocksExternalDataProvider>
      )}
    </Provider>
  );
};

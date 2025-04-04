import { getRegisteredChaiBlock } from "@chaibuilder/runtime";
import { compact, get, map, memoize, omit } from "lodash-es";
import { useCallback } from "react";
import { ChaiBlock } from "../../types/chai-block.ts";
import { useBlocksStore } from "../history/useBlocksStoreUndoableActions.ts";
import { useBrandingOptions } from "./useBrandingOptions";
import { useCurrentPage } from "./useCurrentPage";

/**
 * Get the builder props for a block
 * @param type - The type of the block
 * @returns The builder props for the block
 */
const getBlockBuilderProps = memoize((type: string) => {
  const registeredBlock = getRegisteredChaiBlock(type);
  const props = get(registeredBlock, "schema.properties", {});
  return compact(
    Object.keys(props).map((key) => {
      return get(props[key], "builderProp", false) || get(props[key], "runtime", false) ? key : null;
    }),
  );
});

export const useGetPageData = () => {
  const [projectOptions] = useBrandingOptions();
  const { currentPage } = useCurrentPage();
  const [presentBlocks] = useBlocksStore();

  return useCallback(() => {
    // omit the builder props from the blocks as they are not needed for the page data
    // and only used inside the builder
    const blocks = map(presentBlocks, (block: ChaiBlock) => {
      return omit(block, getBlockBuilderProps(block._type));
    });
    return {
      currentPage,
      blocks,
    };
  }, [projectOptions, currentPage, presentBlocks]);
};

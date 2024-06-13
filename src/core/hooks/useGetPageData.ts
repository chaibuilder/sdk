import { useCallback } from "react";
import { map, omit } from "lodash-es";
import { useBrandingOptions } from "./useBrandingOptions";
import { useCurrentPage } from "./useCurrentPage";
import { splitPageBlocks } from "../functions/split-blocks";
import { useBlocksStore } from "../history/useBlocksStoreUndoableActions.ts";

export const useGetPageData = () => {
  const [projectOptions] = useBrandingOptions();
  const { currentPage } = useCurrentPage();
  const [presentBlocks] = useBlocksStore();

  return useCallback(() => {
    const blocks = map(presentBlocks, (block) =>
      omit(block, ["expanded", "order", "title", "siblings", "tempClasses"]),
    );
    const [pageFilteredBlocks = [], globalBlocks = []] = splitPageBlocks(blocks);
    return {
      currentPage,
      blocks: pageFilteredBlocks,
      globalBlocks,
    };
  }, [projectOptions, currentPage, presentBlocks]);
};

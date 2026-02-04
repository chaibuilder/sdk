import { useBlocksStore } from "@/hooks/history/use-blocks-store-undoable-actions";
import { useWebsitePages } from "@/pages/hooks/pages/use-project-pages";
import { compact, filter, find, get, isEmpty } from "lodash-es";
import { useCallback } from "react";

export const useGetUnpublishedPartialBlocks = () => {
  const [blocksStore] = useBlocksStore();
  const { data: websitePages } = useWebsitePages();

  const getUnpublishedPartialBlocks = useCallback(() => {
    // Get all blocks with _type === 'PartialBlock'
    const partialBlocks = filter(blocksStore, (block) => block._type === "PartialBlock");
    // Extract unique partialBlockId values
    const partialBlockIds = compact(
      partialBlocks.map((block) => get(block, "partialBlockId", ""))
    );
    // Check which ones are unpublished or have unpublished changes
    const unpublishedPages = compact(
      partialBlockIds.map((id) => {
        const page = find(websitePages, { id });
        // Partial block needs publishing if: not online OR has unpublished changes
        if (page && (!page.online || !isEmpty(page.changes))) {
          return page;
        }
        return null;
      })
    );
    const ids = unpublishedPages.map((page: any) => page.id);
    const names = unpublishedPages.map((page: any) => page.name || page.slug || page.id);
    return { ids, names };
  }, [blocksStore, websitePages]);

  return getUnpublishedPartialBlocks;
};

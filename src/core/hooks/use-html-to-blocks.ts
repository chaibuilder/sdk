import { useCallback } from "react";
import { getBlocksFromHTML, mergeBlocksWithExisting } from "../import-html/html-to-json";
import { useBlocksStore } from "./hooks";

export const useHtmlToBlocks = () => {
  const [currentBlocks] = useBlocksStore();
  return useCallback(
    (html: string) => {
      const importedBlocks = getBlocksFromHTML(html);
      const mergedBlocks = mergeBlocksWithExisting(importedBlocks, currentBlocks);
      return mergedBlocks;
    },
    [currentBlocks],
  );
};

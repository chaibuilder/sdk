import { usePagesProps } from "@/pages/hooks/utils/use-pages-props";

/**
 * Hook to check if revisions feature is enabled
 * @returns boolean - true if revisions are enabled, false otherwise (default)
 */
export const useRevisionsEnabled = (): boolean => {
  const [pagesProps] = usePagesProps();
  return pagesProps?.features?.revisions ?? false;
};

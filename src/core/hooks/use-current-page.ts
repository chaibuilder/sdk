import { atom, useAtomValue } from "jotai";

/**
 * Atom to store the current page identifier
 * 
 * Note: If you need to extend this hook with features that require @tanstack/react-query
 * (e.g., fetching page data, language pages, SEO data), ensure that:
 * 1. The components using those extended hooks are wrapped with QueryClientProvider
 * 2. The extended hooks/components are lazy-loaded to prevent eager evaluation
 * 3. Any panel registrations using these hooks are registered inside a function, not at module level
 */
export const currentPageAtom: any = atom<string | null>(null);

export const useCurrentPage = () => {
  const currentPage = useAtomValue(currentPageAtom);
  return { currentPage };
};

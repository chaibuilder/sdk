import { useBlocksStore } from "@/hooks/history/use-blocks-store-undoable-actions";
import { useBuilderProp } from "@/hooks/use-builder-prop";
import { ChaiBlock } from "@/types/common";
import { atom, useAtom } from "jotai";
import { filter, forEach, get, has } from "lodash-es";
import { useCallback, useEffect, useMemo, useState } from "react";

const MAX_PARTIAL_DEPTH = 4;

type PartialBlocksState = Record<
  string,
  {
    loading: boolean;
    error: Error | null | string;
  }
>;

/**
 * Stores the global blocks for the project.
 */
const partialBlocksStoreAtom = atom<Record<string, ChaiBlock[]>>({});
const partialBlocksLoadingStateAtom = atom<PartialBlocksState>({});
const partialDependenciesAtom = atom<Record<string, string[]>>({});

/**
 * Checks if adding targetPartialId to currentPartialId would create a circular dependency.
 * @param currentPartialId - The partial currently being edited
 * @param targetPartialId - The partial being added
 * @param dependencies - Map of partialId to array of partialIds it contains
 * @param visited - Set of already visited partials (for cycle detection)
 * @returns true if adding would create a cycle
 */
export function wouldCreateCycle(
  currentPartialId: string,
  targetPartialId: string,
  dependencies: Record<string, string[]>,
  visited = new Set<string>(),
): boolean {
  // Self-reference
  if (currentPartialId === targetPartialId) return true;

  // Already visited (cycle in graph)
  if (visited.has(targetPartialId)) return false;
  visited.add(targetPartialId);

  // Check if target contains current (directly or transitively)
  const targetDeps = dependencies[targetPartialId] || [];
  for (const dep of targetDeps) {
    if (dep === currentPartialId) return true;
    if (wouldCreateCycle(currentPartialId, dep, dependencies, visited)) return true;
  }

  return false;
}

/**
 * Calculates the maximum nesting depth of a partial.
 * @param partialId - The partial to calculate depth for
 * @param dependencies - Map of partialId to array of partialIds it contains
 * @param visited - Set of already visited partials (for cycle protection)
 * @returns The depth of the partial (1 = no nested partials)
 */
export function getPartialDepth(
  partialId: string,
  dependencies: Record<string, string[]>,
  visited = new Set<string>(),
): number {
  if (visited.has(partialId)) return 0; // Cycle, don't count
  visited.add(partialId);

  const deps = dependencies[partialId] || [];
  if (deps.length === 0) return 1;

  return 1 + Math.max(...deps.map((d) => getPartialDepth(d, dependencies, new Set(visited))));
}

export const usePartialBlocksStore = () => {
  const [partailBlocks, setPartailBlocks] = useAtom(partialBlocksStoreAtom);
  const getPartailBlocks = useCallback((partailBlock: string) => get(partailBlocks, partailBlock, []), [partailBlocks]);
  const reset = useCallback(() => setPartailBlocks({}), [setPartailBlocks]);
  return { getPartailBlocks, reset };
};

export const usePartialDependencies = () => {
  const [dependencies] = useAtom(partialDependenciesAtom);
  return dependencies;
};

export type CanAddPartialResult = {
  canAdd: boolean;
  reason?: string;
};

export const useCanAddPartial = (targetPartialId: string): CanAddPartialResult => {
  const currentPageId = useBuilderProp("pageId", "");
  const [dependencies] = useAtom(partialDependenciesAtom);

  return useMemo(() => {
    // If not editing a partial (regular page), allow all
    if (!currentPageId) return { canAdd: true };

    // Self-reference check
    if (currentPageId === targetPartialId) {
      return { canAdd: false, reason: "Cannot add a partial inside itself" };
    }

    // Circular dependency check
    if (wouldCreateCycle(currentPageId, targetPartialId, dependencies)) {
      return { canAdd: false, reason: "Adding this partial would create a circular reference" };
    }

    // Depth check - calculate what the new depth would be
    const targetDepth = getPartialDepth(targetPartialId, dependencies);
    if (targetDepth >= MAX_PARTIAL_DEPTH) {
      return { canAdd: false, reason: `Maximum nesting depth (${MAX_PARTIAL_DEPTH} levels) would be exceeded` };
    }

    return { canAdd: true };
  }, [currentPageId, targetPartialId, dependencies]);
};

export const useCheckPartialCanAdd = () => {
  const currentPageId = useBuilderProp("pageId", "");
  const [dependencies] = useAtom(partialDependenciesAtom);

  return useCallback(
    (targetPartialId: string): CanAddPartialResult => {
      // If not editing a partial (regular page), allow all
      if (!currentPageId) return { canAdd: true };

      // Self-reference check
      if (currentPageId === targetPartialId) {
        return { canAdd: false, reason: "Cannot add a partial inside itself" };
      }

      // Circular dependency check
      if (wouldCreateCycle(currentPageId, targetPartialId, dependencies)) {
        return { canAdd: false, reason: "Adding this partial would create a circular reference" };
      }

      // Depth check
      const targetDepth = getPartialDepth(targetPartialId, dependencies);
      if (targetDepth >= MAX_PARTIAL_DEPTH) {
        return { canAdd: false, reason: `Maximum nesting depth (${MAX_PARTIAL_DEPTH} levels) would be exceeded` };
      }

      return { canAdd: true };
    },
    [currentPageId, dependencies],
  );
};

export const useWatchPartailBlocks = () => {
  const [blocksStore] = useBlocksStore();
  const [partailBlocks, setPartailBlocks] = useAtom(partialBlocksStoreAtom);
  const [partailBlocksLoadingState, setPartailBlocksLoadingState] = useAtom(partialBlocksLoadingStateAtom);
  const [, setPartialDependencies] = useAtom(partialDependenciesAtom);
  const getPartialBlockBlocks = useBuilderProp("getPartialBlockBlocks", async (_key: string) => []);
  const partialBlocksList = useMemo(() => {
    // Filter blocks of type "PartialBlock" and extract their partialBlockId
    return blocksStore
      .filter((block) => block._type === "PartialBlock" || block._type === "GlobalBlock")
      .map((block) => get(block, "partialBlockId", get(block, "globalBlock", "")));
  }, [blocksStore]);

  useEffect(() => {
    forEach(partialBlocksList, (partialBlock: string) => {
      if (has(partailBlocks, partialBlock) || get(partailBlocksLoadingState, `${partialBlock}.loading`, false)) {
        return;
      }
      setPartailBlocksLoadingState((prevState) => ({ ...prevState, [partialBlock]: { loading: true, error: null } }));
      getPartialBlockBlocks(partialBlock)
        .then((blocks) => {
          setPartailBlocks((prevState) => ({ ...prevState, [partialBlock]: blocks }));
          setPartailBlocksLoadingState((prevState) => ({
            ...prevState,
            [partialBlock]: { loading: false, error: null },
          }));

          // Extract and store dependencies for this partial
          const deps = filter(
            blocks.map((b: ChaiBlock) =>
              b._type === "PartialBlock" || b._type === "GlobalBlock"
                ? get(b, "partialBlockId", get(b, "globalBlock", ""))
                : null,
            ),
            Boolean,
          ) as string[];
          setPartialDependencies((prevState) => ({ ...prevState, [partialBlock]: deps }));
        })
        .catch((error) => {
          setPartailBlocksLoadingState((prevState) => ({
            ...prevState,
            [partialBlock]: { loading: false, error: error.message },
          }));
        });
    });
  }, [
    getPartialBlockBlocks,
    partailBlocks,
    partailBlocksLoadingState,
    setPartailBlocks,
    setPartailBlocksLoadingState,
    setPartialDependencies,
    partialBlocksList,
  ]);
};

type PartialBlockList = Record<string, { name?: string; description?: string; type?: string }>;
const partialBlocksListAtom = atom<PartialBlockList>({});

export const usePartialBlocksList = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [partialBlocksList, setPartialBlocksList] = useAtom(partialBlocksListAtom);
  const getPartialBlocks = useBuilderProp("getPartialBlocks", async () => []);

  const fetchPartialBlocks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const partialBlocks = await getPartialBlocks();
      setPartialBlocksList(partialBlocks as any);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch partial blocks");
      setLoading(false);
    }
  }, [getPartialBlocks, setPartialBlocksList]);

  useEffect(() => {
    fetchPartialBlocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data: partialBlocksList, isLoading: loading, refetch: fetchPartialBlocks, error };
};

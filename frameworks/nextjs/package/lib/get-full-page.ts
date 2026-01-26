import { db, safeQuery, schema } from "@chaibuilder/sdk/actions";
import { ChaiBlock, ChaiPage } from "@chaibuilder/sdk/types";
import { and, eq, inArray } from "drizzle-orm";
import { get, has, isEmpty } from "lodash";

export type GetFullPageOptions = {
  id: string;
  draft: boolean;
  mergeGlobal?: boolean;
  mergePartials?: boolean;
  editor?: boolean;
  userId?: string;
};

export async function getFullPage(
  pageId: string,
  appId: string,
  draftMode: boolean,
  options: Partial<GetFullPageOptions> = {},
): Promise<
  Pick<
    ChaiPage,
    | "id"
    | "name"
    | "slug"
    | "lang"
    | "primaryPage"
    | "seo"
    | "currentEditor"
    | "pageType"
    | "lastSaved"
    | "dynamic"
    | "parent"
    | "blocks"
  >
> {
  const table = draftMode ? schema.appPages : schema.appPagesOnline;

  // Get page data with selected fields
  const { data: pageResult, error } = await safeQuery(() =>
    db
      .select({
        id: table.id,
        name: table.name,
        slug: table.slug,
        lang: table.lang,
        primaryPage: table.primaryPage,
        seo: table.seo,
        currentEditor: table.currentEditor,
        pageType: table.pageType,
        lastSaved: table.lastSaved,
        dynamic: table.dynamic,
        parent: table.parent,
      })
      .from(table)
      .where(and(eq(table.app, appId), eq(table.id, pageId)))
      .limit(1),
  );

  if (error || !pageResult || pageResult.length === 0) {
    throw new Error("PAGE_NOT_FOUND");
  }

  const page = pageResult[0];
  if (!page) {
    throw new Error("PAGE_NOT_FOUND");
  }

  const primaryPageId = page.primaryPage ?? page.id;

  // Get blocks from the primary page
  const { data: blocksResult, error: blocksError } = await safeQuery(() =>
    db
      .select({
        blocks: table.blocks,
      })
      .from(table)
      .where(and(eq(table.app, appId), eq(table.id, primaryPageId)))
      .limit(1),
  );

  if (blocksError) {
    throw new Error("FAILED_TO_FETCH_PAGE_BLOCKS");
  }

  let blocks = (blocksResult?.[0]?.blocks as ChaiBlock[]) ?? [];

  // Merge partials if requested
  const shouldMergePartials = options.mergeGlobal ?? options.mergePartials ?? false;
  if (shouldMergePartials) {
    blocks = await getMergedBlocks(blocks, draftMode, appId);
  }

  // Handle editor locking for draft pages
  let currentEditor = page.currentEditor;

  return {
    id: pageId,
    name: page.name,
    slug: page.slug,
    lang: page.lang,
    primaryPage: page.primaryPage,
    seo: page.seo ?? {},
    currentEditor,
    pageType: page.pageType!,
    lastSaved: page.lastSaved!,
    dynamic: page.dynamic!,
    parent: page.parent,
    blocks,
  };
}

/**
 * Merge partial blocks into the main blocks array with recursive resolution and circular dependency detection
 * Optimized to fetch all partial blocks in a single query
 */
async function getMergedBlocks(blocks: ChaiBlock[], draft: boolean, appId: string): Promise<ChaiBlock[]> {
  const table = draft ? schema.appPages : schema.appPagesOnline;
  const partialBlocksList = blocks.filter(({ _type }) => _type === "GlobalBlock" || _type === "PartialBlock");

  if (partialBlocksList.length === 0) {
    return blocks;
  }

  // Collect all partial block IDs recursively
  const allPartialIds = new Set<string>();
  const toProcess = [...partialBlocksList];
  const processedIds = new Set<string>();

  // First pass: collect all partial IDs that need to be fetched (including nested ones)
  while (toProcess.length > 0) {
    const partialBlock = toProcess.shift()!;
    const partialBlockId = get(partialBlock, "partialBlockId", get(partialBlock, "globalBlock", ""));

    if (partialBlockId === "" || processedIds.has(partialBlockId)) continue;

    allPartialIds.add(partialBlockId);
    processedIds.add(partialBlockId);
  }

  if (allPartialIds.size === 0) {
    return blocks;
  }

  // Fetch all partial blocks in ONE query
  const { data: partialResults } = await safeQuery(() =>
    db
      .select({
        id: table.id,
        blocks: table.blocks,
      })
      .from(table)
      .where(and(eq(table.app, appId), inArray(table.id, Array.from(allPartialIds)))),
  );

  // Create a map for quick lookup: { partialBlockId: blocks[] }
  const partialBlocksMap = new Map<string, ChaiBlock[]>();
  if (partialResults) {
    partialResults.forEach((result: { id: string; blocks: unknown }) => {
      partialBlocksMap.set(result.id, (result.blocks as ChaiBlock[]) ?? []);
    });

    // Second pass: discover nested partial references
    for (const [partialId, partialBlocks] of partialBlocksMap.entries()) {
      const nestedPartials = partialBlocks.filter((block) => block._type === "GlobalBlock" || block._type === "PartialBlock");

      for (const nestedPartial of nestedPartials) {
        const nestedId = get(nestedPartial, "partialBlockId", get(nestedPartial, "globalBlock", ""));
        if (nestedId !== "" && !allPartialIds.has(nestedId) && !processedIds.has(nestedId)) {
          allPartialIds.add(nestedId);
          toProcess.push(nestedPartial);
        }
      }
    }

    // Fetch any additional nested partials discovered
    if (toProcess.length > 0) {
      const additionalIds = Array.from(allPartialIds).filter(id => !partialBlocksMap.has(id));
      if (additionalIds.length > 0) {
        const { data: additionalResults } = await safeQuery(() =>
          db
            .select({
              id: table.id,
              blocks: table.blocks,
            })
            .from(table)
            .where(and(eq(table.app, appId), inArray(table.id, additionalIds))),
        );

        if (additionalResults) {
          additionalResults.forEach((result: { id: string; blocks: unknown }) => {
            partialBlocksMap.set(result.id, (result.blocks as ChaiBlock[]) ?? []);
          });
        }
      }
    }
  }

  // Convert map to Record for the merge function
  const partialsRecord: Record<string, ChaiBlock[]> = {};
  partialBlocksMap.forEach((blocks, id) => {
    partialsRecord[id] = blocks;
  });

  // Use recursive merge with circular dependency detection
  return mergePartialsRecursively(blocks, partialsRecord);
}

/**
 * Recursively merges partial blocks with circular dependency detection
 */
function mergePartialsRecursively(
  blocks: ChaiBlock[],
  partials: Record<string, ChaiBlock[]>,
  visitedStack: string[] = [],
): ChaiBlock[] {
  const partialBlocksList = blocks.filter((block) => block._type === "GlobalBlock" || block._type === "PartialBlock");

  for (let i = 0; i < partialBlocksList.length; i++) {
    const partialBlock = partialBlocksList[i];
    if (!partialBlock) continue;

    const partialBlockId = get(partialBlock, "partialBlockId", get(partialBlock, "globalBlock", ""));
    if (partialBlockId === "") continue;

    // Check for circular dependency
    if (visitedStack.includes(partialBlockId)) {
      const circularChain = [...visitedStack, partialBlockId].join(" -> ");
      throw new Error(
        `Circular dependency detected in partial blocks: ${circularChain}. ` +
          `Partial "${partialBlockId}" is already being processed in the dependency chain.`,
      );
    }

    let partialBlocks = partials[partialBlockId] ?? [];

    // Inherit parent properties
    if (partialBlocks.length > 0) {
      partialBlocks = partialBlocks.map((block) => {
        const blockCopy = { ...block };
        if (isEmpty(blockCopy._parent)) blockCopy._parent = partialBlock._parent;
        if (has(partialBlock, "_show")) blockCopy._show = partialBlock._show;
        return blockCopy;
      });

      // Recursively process nested partials
      partialBlocks = mergePartialsRecursively(partialBlocks, partials, [...visitedStack, partialBlockId]);
    }

    // Replace the reference with actual content
    const index = blocks.indexOf(partialBlock);
    if (index !== -1) {
      blocks.splice(index, 1, ...partialBlocks);
    }
  }

  return blocks;
}

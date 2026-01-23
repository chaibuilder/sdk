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
 * Merge partial blocks into the main blocks array
 * Optimized to fetch all partial blocks in a single query
 */
async function getMergedBlocks(blocks: ChaiBlock[], draft: boolean, appId: string): Promise<ChaiBlock[]> {
  const table = draft ? schema.appPages : schema.appPagesOnline;
  const partialBlocksList = blocks.filter(({ _type }) => _type === "GlobalBlock" || _type === "PartialBlock");

  if (partialBlocksList.length === 0) {
    return blocks;
  }

  // Collect all partial block IDs
  const partialBlockIds = partialBlocksList
    .map((partialBlock) => get(partialBlock, "partialBlockId", get(partialBlock, "globalBlock", "")))
    .filter((id) => id !== "");

  if (partialBlockIds.length === 0) {
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
      .where(and(eq(table.app, appId), inArray(table.id, partialBlockIds))),
  );

  // Create a map for quick lookup: { partialBlockId: blocks[] }
  const partialBlocksMap = new Map<string, ChaiBlock[]>();
  if (partialResults) {
    partialResults.forEach((result: { id: string; blocks: unknown }) => {
      partialBlocksMap.set(result.id, (result.blocks as ChaiBlock[]) ?? []);
    });
  }

  // Replace partial blocks with their actual content
  for (let i = 0; i < partialBlocksList.length; i++) {
    const partialBlock = partialBlocksList[i];
    if (!partialBlock) continue;

    const partialBlockId = get(partialBlock, "partialBlockId", get(partialBlock, "globalBlock", ""));
    if (partialBlockId === "") continue;

    let partialBlocks = partialBlocksMap.get(partialBlockId) ?? [];

    // Inherit parent properties
    if (partialBlocks.length > 0) {
      partialBlocks = partialBlocks.map((block) => {
        if (isEmpty(block._parent)) block._parent = partialBlock._parent;
        if (has(partialBlock, "_show")) block._show = partialBlock._show;
        return block;
      });
    }

    // Replace the reference with actual content
    const index = blocks.indexOf(partialBlock);
    if (index !== -1) {
      blocks.splice(index, 1, ...partialBlocks);
    }
  }

  return blocks;
}

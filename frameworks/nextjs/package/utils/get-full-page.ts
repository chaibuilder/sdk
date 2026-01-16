import { ChaiBlock } from "@chaibuilder/sdk/runtime";
import { db, safeQuery, schema } from "@chaibuilder/sdk/server";
import { differenceInMinutes } from "date-fns";
import { and, eq, inArray, sql } from "drizzle-orm";
import { get, has, isEmpty } from "lodash";

export type GetFullPageOptions = {
  id: string;
  draft: boolean;
  mergeGlobal?: boolean;
  mergePartials?: boolean;
  editor?: boolean;
  userId?: string;
};

export type FullPageResponse = {
  id: string;
  name: string;
  slug: string;
  lang: string;
  primaryPage?: string | null;
  seo: any;
  currentEditor?: string | null;
  pageType?: string | null;
  lastSaved?: string | null;
  tracking: any;
  dynamic: boolean | null;
  parent?: string | null;
  blocks: ChaiBlock[];
  languagePageId: string;
};

export async function getFullPage(
  pageId: string,
  appId: string,
  draftMode: boolean,
  options: Partial<GetFullPageOptions> = {},
): Promise<FullPageResponse> {
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
        tracking: table.tracking,
        dynamic: table.dynamic,
        parent: table.parent,
      })
      .from(table)
      .where(and(eq(table.app, appId), eq(table.id, pageId)))
      .limit(1),
  );

  if (error || !pageResult || pageResult.length === 0) {
    throw new Error("Page not found");
  }

  const page = pageResult[0];
  if (!page) {
    throw new Error("Page data is invalid");
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
    throw new Error("Failed to fetch page blocks");
  }

  let blocks = (blocksResult?.[0]?.blocks as ChaiBlock[]) ?? [];

  // Merge partials if requested
  const shouldMergePartials = options.mergeGlobal ?? options.mergePartials ?? false;
  if (shouldMergePartials) {
    blocks = await getMergedBlocks(blocks, draftMode, appId);
  }

  // Handle editor locking for draft pages
  let currentEditor = page.currentEditor;

  if (draftMode && options.editor && options.userId) {
    const lockResult = await handleEditorLock(page, primaryPageId, options.userId, appId);
    currentEditor = lockResult.currentEditor;
  }

  return {
    id: pageId,
    name: page.name,
    slug: page.slug,
    lang: page.lang,
    primaryPage: page.primaryPage ?? null,
    seo: page.seo,
    currentEditor,
    pageType: page.pageType ?? null,
    lastSaved: page.lastSaved ?? null,
    tracking: page.tracking,
    dynamic: page.dynamic ?? null,
    parent: page.parent ?? null,
    blocks,
    languagePageId: page.id,
  };
}

/**
 * Handle editor locking logic
 */
async function handleEditorLock(
  page: any,
  primaryPageId: string,
  userId: string,
  appId: string,
): Promise<{ currentEditor: string | null }> {
  const now = new Date();
  let canTakePage = false;

  // Check if we can take over the page (no editor or last save > 5 minutes ago)
  if (page.lastSaved) {
    const lastSaved = new Date(page.lastSaved);
    canTakePage = differenceInMinutes(now, lastSaved) > 5;
  }

  const isCurrentEditorNull = page.currentEditor === null;

  if (isCurrentEditorNull || canTakePage) {
    // Take over the page
    await safeQuery(() =>
      db
        .update(schema.appPages)
        .set({
          currentEditor: userId,
          lastSaved: sql`now()`,
        })
        .where(and(eq(schema.appPages.id, primaryPageId), eq(schema.appPages.app, appId))),
    );
    return { currentEditor: userId };
  } else if (page.currentEditor === userId) {
    // Update last saved time for current editor
    await safeQuery(() =>
      db
        .update(schema.appPages)
        .set({
          lastSaved: sql`now()`,
        })
        .where(and(eq(schema.appPages.id, primaryPageId), eq(schema.appPages.app, appId))),
    );
    return { currentEditor: userId };
  }

  return { currentEditor: page.currentEditor };
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

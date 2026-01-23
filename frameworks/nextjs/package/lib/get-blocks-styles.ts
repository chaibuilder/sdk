import { getStylesForBlocks } from "@chaibuilder/sdk/render";
import type { ChaiBlock } from "@chaibuilder/sdk/types";

export async function getBlocksStyles(blocks: ChaiBlock[]): Promise<string> {
  return await getStylesForBlocks(blocks, false);
}

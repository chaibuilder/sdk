import { getStylesForBlocks } from "@chaibuilder/sdk/render";
import { ChaiBlock } from "@chaibuilder/sdk/runtime";

export async function getBlocksStyles(blocks: ChaiBlock[]): Promise<string> {
  return await getStylesForBlocks(blocks, false);
}

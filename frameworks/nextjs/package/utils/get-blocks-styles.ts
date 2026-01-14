import { ChaiBlock } from "@chaibuilder/runtime";
import { getStylesForBlocks } from "@chaibuilder/sdk/render";

export async function getBlocksStyles(blocks: ChaiBlock[]): Promise<string> {
  return await getStylesForBlocks(blocks, false);
}

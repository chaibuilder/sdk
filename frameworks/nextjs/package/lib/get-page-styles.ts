import { getStylesForBlocks } from "@chaibuilder/sdk/render";
import type { ChaiBlock } from "@chaibuilder/sdk/types";

export const getPageStyles = async (blocks: ChaiBlock[]) => {
  const styles = await getStylesForBlocks(blocks);
  return styles.replace(/\s+/g, " ").trim();
};

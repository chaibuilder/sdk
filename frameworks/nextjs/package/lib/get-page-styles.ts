import { getStylesForBlocks } from "@chaibuilder/sdk/render";
import { ChaiBlock } from "@chaibuilder/sdk/runtime";
import { filterDuplicateStyles } from "./styles-helper";

export const getPageStyles = async (blocks: ChaiBlock[]) => {
  const styles = await getStylesForBlocks(blocks);
  const minifiedStyles = styles.replace(/\s+/g, " ").trim();
  return await filterDuplicateStyles(minifiedStyles);
};

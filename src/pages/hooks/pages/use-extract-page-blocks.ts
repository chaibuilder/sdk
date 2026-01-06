import { ChaiBlock } from "@chaibuilder/sdk";
import {
  getDefaultBlockProps,
  useRegisteredChaiBlocks,
} from "@chaibuilder/sdk/runtime";
import {
  endsWith,
  filter,
  has,
  includes,
  isEmpty,
  keys,
  pick,
  pickBy,
} from "lodash-es";
import { useMemo } from "react";

type ExtractedTemplateData = {
  blocks: ChaiBlock[];
};

export const syncBlocksWithDefaults = (
  REGISTERED_CHAI_BLOCKS: Record<string, any>,
  blocks: ChaiBlock[]
): ChaiBlock[] => {
  return blocks.map((block) => {
    if (has(REGISTERED_CHAI_BLOCKS, block._type)) {
      const defaults = getDefaultBlockProps(block._type);
      return {
        ...defaults,
        ...pick(block, [
          ...keys(defaults),
          ...["_type", "_id", "_name", "_parent", "_bindings"],
        ]),
        ...pickBy(block, (_, c) => endsWith(c, "_attrs")),
        ...block,
      } as ChaiBlock;
    }
    return block;
  });
};

export const useExtractPageBlocks = (
  pageBlocks: ChaiBlock[]
): ExtractedTemplateData => {
  const regBlcoks = useRegisteredChaiBlocks();
  return useMemo(() => {
    if (!pageBlocks || isEmpty(pageBlocks)) return { blocks: [] };
    const blocks = filter(
      pageBlocks,
      (block: ChaiBlock) => !includes(block?._type, "@chai/")
    ) as ChaiBlock[];

    return { blocks: syncBlocksWithDefaults(regBlcoks, blocks) };
  }, [pageBlocks, regBlcoks]);
};

import { cloneDeep, find, forEach, get, includes, isEmpty, isString, keys, memoize, startsWith } from "lodash-es";
import { useCallback } from "react";
import { twMerge } from "tailwind-merge";
import { getRegisteredChaiBlock } from "../../../../runtime";
import { STYLES_KEY } from "../../../constants/STRINGS";
import { useBlocksStore } from "../../../hooks";
import { getSplitChaiClasses } from "../../../hooks/getSplitClasses";
import { ChaiBlock } from "../../../types/ChaiBlock";

export function applyLanguage(_block: ChaiBlock, selectedLang: string, chaiBlock) {
  const i18nProps = get(chaiBlock, "i18nProps", []);
  if (isEmpty(selectedLang) || isEmpty(i18nProps)) return _block;

  const block = cloneDeep(_block);
  forEach(keys(block), (key) => {
    if (includes(i18nProps, key) && !isEmpty(selectedLang)) {
      block[key] = get(block, `${key}-${selectedLang}`, block[key]);
    }
  });
  return block;
}

export const applyBinding = (block: ChaiBlock, pageExternalData: Record<string, any>) => {
  const clonedBlock = cloneDeep(block);
  forEach(keys(clonedBlock), (key) => {
    if (isString(clonedBlock[key]) && !startsWith(key, "_")) {
      let value = clonedBlock[key];
      // check for {{string.key}} and replace with pageExternalData
      const bindingRegex = /\{\{(.*?)\}\}/g;
      const matches = value.match(bindingRegex);
      if (matches) {
        matches.forEach((match) => {
          const binding = match.slice(2, -2);
          const bindingValue = get(pageExternalData, binding, match);
          value = value.replace(match, bindingValue);
        });
      }
      clonedBlock[key] = value;
    }
  });
  return clonedBlock;
};

const generateClassNames = memoize((styles: string) => {
  const { baseClasses, classes } = getSplitChaiClasses(styles);
  return twMerge(baseClasses, classes);
});

function getElementAttrs(block: ChaiBlock, key: string) {
  return get(block, `${key}_attrs`, {}) as Record<string, string>;
}

export function getBlockTagAttributes(block: ChaiBlock) {
  const styles: Record<string, any> = {};
  Object.keys(block).forEach((key) => {
    if (isString(block[key]) && block[key].startsWith(STYLES_KEY)) {
      const className = generateClassNames(block[key]);
      const attrs = getElementAttrs(block, key);
      styles[key] = {
        className,
        "data-style-prop": key,
        "data-block-parent": block._id,
        "data-style-id": `${key}-${block._id}`,
        ...attrs,
      };
    }
  });
  return styles;
}

export const getBlockRuntimeProps = memoize((blockType: string) => {
  const chaiBlock = getRegisteredChaiBlock(blockType) as any;
  const props = get(chaiBlock, "schema.properties", {});
  // return key value with value has runtime: true
  return Object.fromEntries(Object.entries(props).filter(([, value]) => get(value, "runtime", false)));
});

export const useBlockRuntimeProps = () => {
  const [allBlocks] = useBlocksStore();
  return useCallback(
    (blockId: string, runtimeProps: Record<string, any>) => {
      if (isEmpty(runtimeProps)) return {};
      return Object.entries(runtimeProps).reduce((acc, [key, schema]) => {
        const hierarchy = [];
        let block = find(allBlocks, { _id: blockId });
        while (block) {
          hierarchy.push(block);
          block = find(allBlocks, { _id: block._parent });
        }
        const matchingBlock = find(hierarchy, { _type: schema.block });
        if (matchingBlock) {
          acc[key] = get(matchingBlock, get(schema, "prop"), null);
        }
        return acc;
      }, {});
    },
    [allBlocks],
  );
};

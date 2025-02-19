import { filter, get, isEmpty, isNull, map } from "lodash-es";
import { createElement, Suspense, useMemo } from "react";
import { getRegisteredChaiBlock } from "../../../../runtime";
import { useBlocksStore } from "../../../hooks";
import { useLanguages } from "../../../hooks/useLanguages";
import { ChaiBlock } from "../../../types/ChaiBlock";
import {
  applyLanguage,
  getBlockRuntimeProps,
  getBlockTagAttributes,
  useBlockRuntimeProps,
} from "./NewBlocksRenderHelperts";

const RenderBlock = ({ block, children }: { block: ChaiBlock; children: React.ReactNode }) => {
  const registeredChaiBlock = getRegisteredChaiBlock(block._type) as any;
  const { selectedLang, fallbackLang } = useLanguages();
  const getRuntimePropValues = useBlockRuntimeProps();
  const Component = get(registeredChaiBlock, "component", null);
  if (isNull(Component)) return null;
  const blockProps = {
    "data-block-id": block._id,
    "data-block-type": block._type,
  };
  const props = useMemo(
    () => ({
      blockProps,
      inBuilder: true,
      lang: selectedLang || fallbackLang,
      ...applyLanguage(block, selectedLang, registeredChaiBlock),
      ...getBlockTagAttributes(block),
      ...getRuntimePropValues(block._id, getBlockRuntimeProps(block._type)),
    }),
    [block, selectedLang, fallbackLang, registeredChaiBlock, getRuntimePropValues],
  );
  return <Suspense>{createElement(Component, { ...props, children })}</Suspense>;
};

const RenderBlocks = ({ filterFn }: { filterFn: (block: ChaiBlock) => boolean }) => {
  const [blocks] = useBlocksStore();
  const filteredBlocks = useMemo(() => filter(blocks, filterFn), [blocks, filterFn]);
  const hasChildren = (blockId: string) => filter(blocks, (b) => b._parent === blockId).length > 0;

  return map(filteredBlocks, (block) => {
    return (
      <RenderBlock key={block._id} block={block}>
        {hasChildren(block._id) ? <RenderBlocks filterFn={(b) => b._parent === block._id} /> : null}
      </RenderBlock>
    );
  });
};

export const NewBlocksRenderer = () => {
  return <RenderBlocks filterFn={(block) => isEmpty(block._parent)} />;
};

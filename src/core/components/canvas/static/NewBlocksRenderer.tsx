import { filter, get, isEmpty, isNull, map } from "lodash-es";
import { createElement, Suspense, useMemo } from "react";
import { getRegisteredChaiBlock } from "../../../../runtime";
import { usePageExternalData } from "../../../atoms/builder";
import { useBlocksStore } from "../../../hooks";
import { useLanguages } from "../../../hooks/useLanguages";
import { ChaiBlock } from "../../../types/ChaiBlock";
import {
  applyBinding,
  applyLanguage,
  getBlockRuntimeProps,
  getBlockTagAttributes,
  useBlockRuntimeProps,
} from "./NewBlocksRenderHelperts";

const RenderBlock = ({ block, children }: { block: ChaiBlock; children: React.ReactNode }) => {
  const registeredChaiBlock = useMemo(() => getRegisteredChaiBlock(block._type) as any, [block._type]);
  const { selectedLang, fallbackLang } = useLanguages();
  const getRuntimePropValues = useBlockRuntimeProps();
  const pageExternalData = usePageExternalData();
  const Component = get(registeredChaiBlock, "component", null);
  if (isNull(Component)) return null;

  const withBinding = useMemo(
    () => applyBinding(applyLanguage(block, selectedLang, registeredChaiBlock), pageExternalData),
    [block, selectedLang, registeredChaiBlock, pageExternalData],
  );
  const withBlockAttributes = useMemo(() => getBlockTagAttributes(block), [block]);
  const withRuntimeProps = useMemo(() => getRuntimePropValues(block._id, getBlockRuntimeProps(block._type)), [block]);

  const props = useMemo(
    () => ({
      "data-block-id": block._id,
      "data-block-type": block._type,
      inBuilder: true,
      lang: selectedLang || fallbackLang,
      ...withBinding,
      ...withBlockAttributes,
      ...withRuntimeProps,
    }),
    [block, selectedLang, fallbackLang, withBinding, withBlockAttributes, withRuntimeProps],
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

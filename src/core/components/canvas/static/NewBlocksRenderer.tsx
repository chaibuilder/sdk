import { Atom, useAtom } from "jotai";
import { filter, get, has, isEmpty, isFunction, isNull, map } from "lodash-es";
import { createElement, Suspense, useMemo } from "react";
import { getRegisteredChaiBlock } from "../../../../runtime";
import { convertToBlocksAtoms } from "../../../atoms/blocks";
import { usePageExternalData } from "../../../atoms/builder";
import { dataBindingActiveAtom, inlineEditingActiveAtom } from "../../../atoms/ui";
import { useBlocksStore, useGlobalBlocksStore, useHiddenBlockIds } from "../../../hooks";
import { useLanguages } from "../../../hooks/useLanguages";
import { ChaiBlock } from "../../../types/ChaiBlock";
import {
  applyBinding,
  applyLanguage,
  getBlockRuntimeProps,
  getBlockTagAttributes,
  useBlockRuntimeProps,
} from "./NewBlocksRenderHelperts";

const BlockRenderer = ({ blockAtom, children }: { blockAtom: Atom<ChaiBlock>; children: React.ReactNode }) => {
  const [block] = useAtom(blockAtom);
  const registeredChaiBlock = useMemo(() => getRegisteredChaiBlock(block._type) as any, [block._type]);
  const { selectedLang, fallbackLang } = useLanguages();
  const getRuntimePropValues = useBlockRuntimeProps();
  const pageExternalData = usePageExternalData();
  const [hiddenBlocks] = useHiddenBlockIds();
  const [editingBlockId] = useAtom(inlineEditingActiveAtom);
  const [dataBindingActive] = useAtom(dataBindingActiveAtom);
  const Component = get(registeredChaiBlock, "component", null);

  const dataBindingProps = useMemo(
    () =>
      dataBindingActive
        ? applyBinding(applyLanguage(block, selectedLang, registeredChaiBlock), pageExternalData)
        : applyLanguage(block, selectedLang, registeredChaiBlock),
    [block, selectedLang, registeredChaiBlock, pageExternalData, dataBindingActive],
  );
  const blockAttributesProps = useMemo(() => getBlockTagAttributes(block), [block]);
  const runtimeProps = useMemo(() => getRuntimePropValues(block._id, getBlockRuntimeProps(block._type)), [block]);
  const dataProviderProps = useMemo(() => {
    if (!has(registeredChaiBlock, "dataProvider") || !isFunction(registeredChaiBlock.dataProvider)) return {};
    return registeredChaiBlock.dataProvider(block, selectedLang);
  }, [block, selectedLang, registeredChaiBlock]);

  const props = useMemo(
    () => ({
      blockProps: {
        "data-block-id": block._id,
        "data-block-type": block._type,
      },
      inBuilder: true,
      lang: selectedLang || fallbackLang,
      ...dataBindingProps,
      ...blockAttributesProps,
      ...runtimeProps,
      ...dataProviderProps,
    }),
    [block, selectedLang, fallbackLang, dataBindingProps, blockAttributesProps, runtimeProps, dataProviderProps],
  );

  if (isNull(Component) || hiddenBlocks.includes(block._id) || editingBlockId === block._id) return null;
  return <Suspense>{createElement(Component, { ...props, children })}</Suspense>;
};

const GlobalBlocksRenderer = ({ blockAtom }: { blockAtom: Atom<ChaiBlock> }) => {
  const { getGlobalBlocks } = useGlobalBlocksStore();
  const [block] = useAtom(blockAtom);
  const globalBlocks = useMemo(() => getGlobalBlocks(block?.globalBlock), [block?.globalBlock, getGlobalBlocks]);
  const globalBlocksAtoms = useMemo(() => convertToBlocksAtoms(globalBlocks), [globalBlocks]);
  return <BlocksRenderer blocks={globalBlocksAtoms} filterFn={(block) => isEmpty(block._parent)} />;
};

const BlocksRenderer = ({
  blocks,
  filterFn,
}: {
  blocks: { _id: string; _parent: string | null; _atom: Atom<ChaiBlock>; _type: string }[];
  filterFn: (block: ChaiBlock) => boolean;
}) => {
  const filteredBlocks = useMemo(() => filter(blocks, filterFn), [blocks, filterFn]);
  const hasChildren = (blockId: string) => filter(blocks, (b) => b._parent === blockId).length > 0;

  return map(filteredBlocks, (block) => {
    return (
      <BlockRenderer key={block._id} blockAtom={block._atom}>
        {block._type === "GlobalBlock" ? (
          <GlobalBlocksRenderer blockAtom={block._atom} />
        ) : hasChildren(block._id) ? (
          <BlocksRenderer blocks={blocks} filterFn={(b) => b._parent === block._id} />
        ) : null}
      </BlockRenderer>
    );
  });
};

export const PageBlocksRenderer = () => {
  const [blocks] = useBlocksStore();
  return <BlocksRenderer blocks={blocks} filterFn={(block) => isEmpty(block._parent)} />;
};

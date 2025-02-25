import { atom, Atom, Provider, useAtom } from "jotai";
import { splitAtom } from "jotai/utils";
import { filter, get, has, isEmpty, isFunction, isNull, map } from "lodash-es";
import { createElement, Suspense, useCallback, useMemo } from "react";
import { getRegisteredChaiBlock } from "../../../../runtime";
import { pageBlocksAtomsAtom } from "../../../atoms/blocks";
import { usePageExternalData } from "../../../atoms/builder";
import { builderStore } from "../../../atoms/store";
import { dataBindingActiveAtom } from "../../../atoms/ui";
import { useBlocksStore, useGlobalBlocksStore, useHiddenBlockIds } from "../../../hooks";
import { useLanguages } from "../../../hooks/useLanguages";
import { useGetBlockAtom } from "../../../hooks/useUpdateBlockAtom";
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

  if (isNull(Component) || hiddenBlocks.includes(block._id)) return null;
  return <Suspense>{createElement(Component, { ...props, children })}</Suspense>;
};

const GlobalBlocksRenderer = ({ globalBlockId }: { globalBlockId: string }) => {
  const { getGlobalBlocks } = useGlobalBlocksStore();
  const globalBlocks = useMemo(() => getGlobalBlocks(globalBlockId), [getGlobalBlocks, globalBlockId]);
  const globalBlocksAtoms = useMemo(() => splitAtom(atom(globalBlocks)), [globalBlocks]);
  if (isEmpty(globalBlocks)) return null;
  return <BlocksRenderer splitAtoms={globalBlocksAtoms} blocks={globalBlocks} />;
};

const BlocksRenderer = ({
  blocks,
  parent = null,
  splitAtoms = undefined,
}: {
  splitAtoms?: any;
  blocks: ChaiBlock[];
  parent?: string;
}) => {
  const getBlockAtom = useGetBlockAtom(splitAtoms);
  const filteredBlocks = useMemo(
    () =>
      filter(blocks, (block) => has(block, "_id") && (!isEmpty(parent) ? block._parent === parent : !block._parent)),
    [blocks, parent],
  );
  const hasChildren = useCallback((block) => filter(blocks, (b) => b._parent === block._id).length > 0, [blocks]);

  return map(filteredBlocks, (block) => {
    const blockAtom = getBlockAtom(block._id);
    if (!blockAtom) return null;
    return (
      <BlockRenderer key={block._id} blockAtom={blockAtom}>
        {block._type === "GlobalBlock" ? (
          <Provider store={builderStore}>
            <GlobalBlocksRenderer globalBlockId={get(block, "globalBlock", "")} />
          </Provider>
        ) : hasChildren(block) ? (
          <BlocksRenderer splitAtoms={splitAtoms} blocks={blocks} parent={block._id} />
        ) : null}
      </BlockRenderer>
    );
  });
};

export const PageBlocksRenderer = () => {
  const [blocks] = useBlocksStore();
  return <BlocksRenderer splitAtoms={pageBlocksAtomsAtom} blocks={blocks} />;
};

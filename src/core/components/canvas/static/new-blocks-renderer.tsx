import { pageBlocksAtomsAtom } from "@/core/atoms/blocks";
import { usePageExternalData } from "@/core/atoms/builder";
import { builderStore } from "@/core/atoms/store";
import { dataBindingActiveAtom } from "@/core/atoms/ui";
import {
  applyBinding,
  applyLanguage,
  applyLimit,
  getBlockRuntimeProps,
  getBlockTagAttributes,
} from "@/core/components/canvas/static/new-blocks-render-helpers";
import { useBlocksStore, useHiddenBlockIds, usePartailBlocksStore } from "@/core/hooks";
import { useLanguages } from "@/core/hooks/use-languages";
import { useGetBlockAtom } from "@/core/hooks/use-update-block-atom";
import { ChaiBlock } from "@/types/chai-block";
import { getRegisteredChaiBlock } from "@chaibuilder/runtime";
import { atom, Atom, Provider, useAtom } from "jotai";
import { splitAtom } from "jotai/utils";
import { filter, get, has, isArray, isEmpty, isFunction, isNull, map } from "lodash-es";
import React, { createContext, createElement, Suspense, useCallback, useContext, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./error-fallback";
import { useBlockRuntimeProps } from "./use-block-runtime-props";

export const RepeaterContext = createContext<{
  index: number;
  key: string;
}>({
  index: -1,
  key: "",
});

const CORE_BLOCKS = [
  "Box",
  "Repeater",
  "GlobalBlock",
  "PartialBlock",
  "Heading",
  "Text",
  "RichText",
  "Span",
  "Image",
  "Button",
  "Paragraph",
  "Link",
  "Video",
  "Audio",
  "Icon",
  "List",
  "ListItem",
  "CustomScript",
  "CustomHTML",
];

const BlockRenderer = ({
  blockAtom,
  children,
}: {
  blockAtom: Atom<ChaiBlock>;
  children: ({
    _id,
    _type,
    repeaterItems,
    repeaterItemsBinding,
    partialBlockId,
  }: {
    _id: string;
    _type: string;
    repeaterItems?: any;
    repeaterItemsBinding?: string;
    partialBlockId?: string;
  }) => React.ReactNode;
}) => {
  const [block] = useAtom(blockAtom);
  const registeredChaiBlock = useMemo(() => getRegisteredChaiBlock(block._type) as any, [block._type]);
  const { selectedLang, fallbackLang } = useLanguages();
  const getRuntimePropValues = useBlockRuntimeProps();
  const pageExternalData = usePageExternalData();
  const [hiddenBlocks] = useHiddenBlockIds();
  const [dataBindingActive] = useAtom(dataBindingActiveAtom);
  const Component = get(registeredChaiBlock, "component", null);
  const { index, key } = useContext(RepeaterContext);

  const dataBindingProps = useMemo(
    () =>
      dataBindingActive
        ? applyBinding(applyLanguage(block, selectedLang, registeredChaiBlock), pageExternalData, { index, key })
        : applyLanguage(block, selectedLang, registeredChaiBlock),
    [block, selectedLang, registeredChaiBlock, pageExternalData, dataBindingActive, index, key],
  );
  const blockAttributesProps = useMemo(() => getBlockTagAttributes(block), [block, getBlockTagAttributes]);
  const runtimeProps = useMemo(
    () => getRuntimePropValues(block._id, getBlockRuntimeProps(block._type)),
    [block._id, block._type, getRuntimePropValues, getBlockRuntimeProps],
  );
  const dataProviderProps = useMemo(() => {
    if (!has(registeredChaiBlock, "dataProvider") || !isFunction(registeredChaiBlock.dataProvider)) return {};
    return registeredChaiBlock.dataProvider({
      block,
      draft: true,
      inBuilder: true,
      lang: selectedLang || fallbackLang,
      pageProps: {},
    });
  }, [block, selectedLang, fallbackLang, registeredChaiBlock, pageExternalData]);

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
    [
      block._id,
      block._type,
      selectedLang,
      fallbackLang,
      dataBindingProps,
      blockAttributesProps,
      runtimeProps,
      dataProviderProps,
    ],
  );
  const needErrorBoundary = useMemo(() => !CORE_BLOCKS.includes(block._type), [block._type]);

  if (isNull(Component) || hiddenBlocks.includes(block._id)) return null;
  const blockNode = (
    <Suspense>
      {createElement(Component, {
        ...props,
        children: children({
          _id: block._id,
          _type: block._type,
          ...(isArray(dataBindingProps.repeaterItems)
            ? {
                repeaterItems: applyLimit(dataBindingProps.repeaterItems, block),
                repeaterItemsBinding: dataBindingProps.repeaterItemsBinding,
              }
            : {}),
          ...(block.partialBlockId ? { partialBlockId: block.partialBlockId } : ""),
          ...(block.globalBlock ? { partialBlockId: block.globalBlock } : ""),
        }),
      })}
    </Suspense>
  );

  return needErrorBoundary ? <ErrorBoundary fallbackRender={ErrorFallback}>{blockNode}</ErrorBoundary> : blockNode;
};

const PartialBlocksRenderer = ({ partialBlockId }: { partialBlockId: string }) => {
  const { getPartailBlocks } = usePartailBlocksStore();
  const partialBlocks = useMemo(() => getPartailBlocks(partialBlockId), [getPartailBlocks, partialBlockId]);
  const partialBlocksAtoms = useMemo(() => splitAtom(atom(partialBlocks)), [partialBlocks]);
  if (isEmpty(partialBlocks)) return null;
  return <BlocksRenderer splitAtoms={partialBlocksAtoms} blocks={partialBlocks} />;
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
  const hasChildren = useCallback(
    (blockId: string) => filter(blocks, (b) => b._parent === blockId).length > 0,
    [blocks],
  );

  return map(filteredBlocks, (block) => {
    const blockAtom = getBlockAtom(block._id);
    if (!blockAtom) return null;
    return (
      <BlockRenderer key={block._id} blockAtom={blockAtom}>
        {({ _id, _type, partialBlockId, repeaterItems, repeaterItemsBinding }) => {
          return _type === "Repeater" ? (
            isArray(repeaterItems) &&
              repeaterItems.map((_, index) => (
                <RepeaterContext.Provider value={{ index, key: repeaterItemsBinding }}>
                  <BlocksRenderer splitAtoms={splitAtoms} blocks={blocks} parent={block._id} />
                </RepeaterContext.Provider>
              ))
          ) : _type === "GlobalBlock" || _type === "PartialBlock" ? (
            <Provider store={builderStore}>
              <PartialBlocksRenderer partialBlockId={partialBlockId} />
            </Provider>
          ) : hasChildren(_id) ? (
            <BlocksRenderer splitAtoms={splitAtoms} blocks={blocks} parent={block._id} />
          ) : null;
        }}
      </BlockRenderer>
    );
  });
};

export const PageBlocksRenderer = () => {
  const [blocks] = useBlocksStore();
  return <BlocksRenderer splitAtoms={pageBlocksAtomsAtom} blocks={blocks} />;
};

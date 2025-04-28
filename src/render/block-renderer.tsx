import {
  applyBinding,
  applyLanguage,
  applyLimit,
  getBlockRuntimeProps,
  getBlockTagAttributes,
} from "@/core/components/canvas/static/new-blocks-render-helpers";
import { getRegisteredChaiBlock } from "@/runtime";
import { ChaiBlock } from "@/types/chai-block";
import { get, has, isArray, isFunction, isNull } from "lodash-es";
import { createElement, Suspense } from "react";
import DataProviderPropsBlock from "./async-props-block";
import { getRuntimePropValues, RenderChaiBlocksProps } from "./render-chai-blocks";

const SuspenseFallback = () => <div></div>;

export const RenderBlock = (
  props: RenderChaiBlocksProps & {
    repeaterData?: { index: number; dataKey: string };
    block: ChaiBlock;
    children: ({
      _id,
      _type,
      repeaterItems,
      repeaterItemsBinding,
    }: {
      _id: string;
      _type: string;
      repeaterItems?: any;
      repeaterItemsBinding?: string;
      partialBlockId?: string;
    }) => React.ReactNode;
  },
) => {
  const { block, lang, fallbackLang, children, externalData, blocks, draft, pageProps, dataProviderMetadataCallback } =
    props;
  const registeredChaiBlock = getRegisteredChaiBlock(block._type);
  const Component = get(registeredChaiBlock, "component", null);
  const index = get(props.repeaterData, "index", -1);
  const dataKey = get(props.repeaterData, "dataKey", "");

  const bindingLangSuffix = lang === fallbackLang ? "" : lang;
  const dataBindingProps = applyBinding(applyLanguage(block, bindingLangSuffix, registeredChaiBlock), externalData, {
    index,
    key: dataKey,
  });
  const blockAttributesProps = getBlockTagAttributes(block);
  const runtimeProps = getRuntimePropValues(blocks, block._id, getBlockRuntimeProps(block._type));
  const hasDataProvider = has(registeredChaiBlock, "dataProvider") && isFunction(registeredChaiBlock.dataProvider);

  const blockProps = {
    blockProps: {},
    inBuilder: false,
    lang: lang || fallbackLang,
    ...dataBindingProps,
    ...blockAttributesProps,
    ...runtimeProps,
  };

  if (isNull(Component)) return null;

  if (hasDataProvider) {
    const suspenseFallback = get(registeredChaiBlock, "suspenseFallback", SuspenseFallback) as React.ComponentType<any>;
    return (
      <Suspense fallback={createElement(suspenseFallback)}>
        {/* @ts-ignore */}
        <DataProviderPropsBlock
          lang={lang}
          pageProps={pageProps}
          block={block}
          dataProvider={registeredChaiBlock.dataProvider}
          dataProviderMetadataCallback={dataProviderMetadataCallback}
          draft={draft}>
          {(dataProviderProps) => {
            return createElement(Component, {
              ...blockProps,
              ...dataProviderProps,
              children: children({
                _id: block._id,
                _type: block._type,
                ...(isArray(dataBindingProps.repeaterItems)
                  ? {
                      repeaterItems: applyLimit(dataBindingProps.repeaterItems, block),
                      repeaterItemsBinding: dataBindingProps.repeaterItemsBinding,
                    }
                  : {}),
              }),
            });
          }}
        </DataProviderPropsBlock>
      </Suspense>
    );
  }

  return (
    <Suspense>
      {createElement(Component, {
        ...blockProps,
        children: children({
          _id: block._id,
          _type: block._type,
          ...(isArray(dataBindingProps.repeaterItems)
            ? {
                repeaterItems: applyLimit(dataBindingProps.repeaterItems, block),
                repeaterItemsBinding: dataBindingProps.repeaterItemsBinding,
              }
            : {}),
        }),
      })}
    </Suspense>
  );
};

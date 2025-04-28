import {
  applyBinding,
  applyLanguage,
  getBlockRuntimeProps,
  getBlockTagAttributes,
} from "@/core/components/canvas/static/new-blocks-render-helpers";
import { RepeaterContext } from "@/core/components/canvas/static/new-blocks-renderer";
import { getRegisteredChaiBlock } from "@/runtime";
import { ChaiBlock } from "@/types/chai-block";
import { get, has, isArray, isFunction, isNull } from "lodash-es";
import { createElement, Suspense, useContext } from "react";
import { getRuntimePropValues, RenderChaiBlocksProps } from "./render-chai-blocks";

export const RenderBlock = (
  props: RenderChaiBlocksProps & {
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
  const { block, lang, fallbackLang, children, externalData, blocks, draft, pageProps } = props;
  const registeredChaiBlock = getRegisteredChaiBlock(block._type);
  const Component = get(registeredChaiBlock, "component", null);
  const { index, key } = useContext(RepeaterContext);

  const bindingLangSuffix = lang === fallbackLang ? "" : lang;
  const dataBindingProps = applyBinding(applyLanguage(block, bindingLangSuffix, registeredChaiBlock), externalData, {
    index,
    key,
  });
  const blockAttributesProps = getBlockTagAttributes(block);
  const runtimeProps = getRuntimePropValues(blocks, block._id, getBlockRuntimeProps(block._type));
  const dataProviderProps =
    has(registeredChaiBlock, "dataProvider") && isFunction(registeredChaiBlock.dataProvider)
      ? registeredChaiBlock.dataProvider({ block, lang, draft, inBuilder: false, pageProps })
      : {};

  const blockProps = {
    blockProps: {},
    inBuilder: false,
    lang: lang || fallbackLang,
    ...dataBindingProps,
    ...blockAttributesProps,
    ...runtimeProps,
    ...dataProviderProps,
  };

  if (isNull(Component)) return null;
  return (
    <Suspense>
      {createElement(Component, {
        ...blockProps,
        children: children({
          _id: block._id,
          _type: block._type,
          ...(isArray(dataBindingProps.repeaterItems)
            ? {
                repeaterItems: dataBindingProps.repeaterItems,
                repeaterItemsBinding: dataBindingProps.repeaterItemsBinding,
              }
            : {}),
        }),
      })}
    </Suspense>
  );
};

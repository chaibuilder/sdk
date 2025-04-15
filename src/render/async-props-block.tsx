import { ChaiBlock, ChaiPageProps } from "@chaibuilder/runtime";
import { has, omit } from "lodash-es";
import React, { Suspense } from "react";

type DataProvider = (props: {
  draft: boolean;
  inBuilder: boolean;
  lang: string;
  block: ChaiBlock;
  pageProps: ChaiPageProps;
}) => Record<string, any> | Promise<Record<string, any>>;

export default async function AsyncPropsBlock(props: {
  lang: string;
  inBuilder: boolean;
  pageProps: ChaiPageProps;
  component: React.ComponentType<any>;
  props: any;
  block: ChaiBlock;
  dataProvider: DataProvider;
  dataProviderMetadataCallback: (block: ChaiBlock, meta: Record<string, any>) => void;
  draft: boolean;
}) {
  const dataProps = await props.dataProvider({
    pageProps: props.pageProps,
    block: props.block,
    lang: props.lang,
    draft: props.draft,
    inBuilder: props.inBuilder,
  });

  if (has(dataProps, "$metadata")) {
    props.dataProviderMetadataCallback(props.block, dataProps.$metadata);
  }

  return (
    <Suspense>
      {React.createElement(props.component, {
        ...omit(props.props, ["dataProvider", "dataProviderMetadataCallback"]),
        ...omit(dataProps, "$metadata"),
        key: `${props.block._id}-async`,
      })}
    </Suspense>
  );
}

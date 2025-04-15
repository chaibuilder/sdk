import { ChaiBlock } from "@chaibuilder/runtime";
import { has, omit } from "lodash-es";
import React, { Suspense } from "react";

type DataProvider =
  | ((block: ChaiBlock, lang: string, metadata: any) => Record<string, any> | Promise<Record<string, any>>)
  | ((props: {
      draft: boolean;
      inBuilder: boolean;
      lang: string;
      [key: string]: any;
    }) => Record<string, any> | Promise<Record<string, any>>);

export default async function AsyncPropsBlock(props: {
  lang: string;
  inBuilder: boolean;
  metadata: Record<string, any>;
  forwardProps: Record<string, any>;
  component: React.ComponentType<any>;
  props: any;
  block: ChaiBlock;
  dataProvider: DataProvider;
  dataProviderMetadataCallback: (block: ChaiBlock, meta: Record<string, any>) => void;
  draft?: boolean;
}) {
  const dataProps = props.forwardProps
    ? await (props.dataProvider as (props: { draft: boolean; lang: string; [key: string]: any }) => any)({
        ...props.forwardProps,
        ...props.block,
        lang: props.lang,
        draft: props.draft,
        inBuilder: props.inBuilder,
      })
    : await (props.dataProvider as (block: ChaiBlock, lang: string, metadata: any) => any)(
        props.block,
        props.lang,
        props.metadata ?? {},
      );

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

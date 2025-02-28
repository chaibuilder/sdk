import { ChaiBlock } from "@chaibuilder/runtime";
import { has, omit } from "lodash-es";
import React, { Suspense } from "react";

export default async function AsyncPropsBlock(props: {
  lang: string;
  metadata: Record<string, any>;
  component: React.ComponentType<any>;
  props: any;
  block: ChaiBlock;
  dataProvider: (block: ChaiBlock, lang: string, metadata: any) => Record<string, any>;
  dataProviderMetadataCallback: (block: ChaiBlock, meta: Record<string, any>) => void;
}) {
  const dataProps = await props?.dataProvider(props.block, props.lang, props.metadata);

  if (has(dataProps, "$metadata")) {
    props.dataProviderMetadataCallback(props.block, dataProps.$metadata);
  }

  return (
    <Suspense>
      {React.createElement(props.component, {
        ...omit(props.props, ["dataProvider", "dataProviderMetadataCallback"]),
        ...omit(dataProps, "$metadata"),
      })}
    </Suspense>
  );
}

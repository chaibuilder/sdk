import { ChaiBlock } from "@chaibuilder/runtime";
import React, { Suspense } from "react";

export default async function AsyncPropsBlock(props: {
  lang: string;
  metadata: Record<string, any>;
  component: React.ComponentType<any>;
  props: any;
  block: ChaiBlock;
  dataProvider: (block: ChaiBlock, lang: string, metadata: any) => Record<string, any>;
}) {
  const dataProps = await props?.dataProvider(props.block, props.lang, props.metadata);
  return <Suspense>{React.createElement(props.component, { ...props.props, ...dataProps })}</Suspense>;
}

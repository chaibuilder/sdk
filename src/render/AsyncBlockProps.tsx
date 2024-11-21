import { ChaiBlock } from "@chaibuilder/runtime";
import React, { Suspense } from "react";

export default async function AsyncPropsBlock(props: {
  metadata: Record<string, any>;
  component: React.ComponentType<any>;
  props: any;
  block: ChaiBlock;
  dataProvider: (args: any) => any;
}) {
  const dataProps = await props?.dataProvider({ block: props.block, ...props.metadata });
  return <Suspense>{React.createElement(props.component, { ...props.props, ...dataProps })}</Suspense>;
}

import { ChaiBlock } from "@chaibuilder/runtime";
import React, { Suspense, useMemo } from "react";

export default function AsyncPropsBlock(props: {
  lang: string;
  component: React.ComponentType<any>;
  props: any;
  block: ChaiBlock;
  dataProvider: (block: ChaiBlock, lang: string) => Record<string, any>;
}) {
  const { dataProvider, block } = props;
  const dataProps = useMemo(() => {
    if (!dataProvider) return {};
    return dataProvider(block, props.lang);
  }, [block, dataProvider, props.lang]);
  return <Suspense>{React.createElement(props.component, { ...props.props, ...dataProps })}</Suspense>;
}

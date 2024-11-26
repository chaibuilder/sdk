import { ChaiBlock } from "@chaibuilder/runtime";
import React, { Suspense, useMemo } from "react";

export default function AsyncPropsBlock(props: {
  component: React.ComponentType<any>;
  props: any;
  block: ChaiBlock;
  dataProvider: (args: any) => any;
}) {
  const { dataProvider, block } = props;
  const dataProps = useMemo(() => {
    if (!dataProvider) return {};
    return dataProvider({ block });
  }, [block, dataProvider]);
  return <Suspense>{React.createElement(props.component, { ...props.props, ...dataProps })}</Suspense>;
}

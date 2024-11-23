import { ChaiBlock, ChaiBlockPropSchema } from "@chaibuilder/runtime";
import React, { Suspense, useMemo } from "react";

export default function RuntimePropsBlock(props: {
  runtimeProps: Record<string, ChaiBlockPropSchema>;
  block: ChaiBlock;
  component: React.ComponentType<any>;
  props: any;
}) {    
  const runtimeProps = useMemo(() => ({}), [props.runtimeProps]);
  return <Suspense>{React.createElement(props.component, { ...props.props, ...runtimeProps })}</Suspense>;
}

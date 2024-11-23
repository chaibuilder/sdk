import { ChaiBlock, ChaiBlockPropSchema } from "@chaibuilder/runtime";
import { get } from "lodash";
import React, { Suspense } from "react";
import { find } from "lodash";
import { useSelectedBlockHierarchy } from "../../../hooks/useSelectedBlockIds";

export default function RuntimePropsBlock(props: {
  runtimeProps: Record<string, ChaiBlockPropSchema>;
  block: ChaiBlock;
  component: React.ComponentType<any>;
  props: any;
}) {
  const hierarchy = useSelectedBlockHierarchy();
  const runtimeProps = Object.entries(props.runtimeProps).reduce((acc, [key, schema]) => {
    const matchingBlock = find(hierarchy, { _type: schema.block });
    if (matchingBlock) {
      acc[key] = get(matchingBlock, schema.prop);
    }
    return acc;
  }, {});
  return <Suspense>{React.createElement(props.component, { ...props.props, ...runtimeProps })}</Suspense>;
}
